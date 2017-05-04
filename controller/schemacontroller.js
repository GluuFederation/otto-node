var mongoose = require('mongoose');
var Ajv = require('ajv');
var JSPath = require('jspath');

var schemaModel = require('../models/schemamodel');
var federationModel = require('../models/federationmodel');
var entityModel = require('../models/entitymodel');
var settings = require('../settings');
var common = require('../helpers/common');

var ajv = Ajv({
  allErrors: true
});

var schemaAJVSchema = {
  properties: {
    name: {
      type: 'string'
    }
  },
  required: ['name']
};

exports.getAllSchemaWithDepth = function (req, callback) {
  var pageNo = +req.query.pageno;
  var pageLength = +req.query.pagelength;
  var depth = '';

  if (!!req.query.depth) {
    depth = [
      {path: 'supportedBy', select: '-_id -__v -updatedAt -createdAt'}
    ];
  }

  schemaModel.find({}).select('-_id -__v -updatedAt -createdAt')
    .populate({path: 'supportedBy', select: '-_id -__v -updatedAt -createdAt'})
    .skip((!!pageLength && !!pageNo ? pageNo * pageLength : 0))
    .limit((!!pageLength ? pageLength : 0))
    .populate(depth)
    .lean()
    .then(function (schemas) {
      if (!req.query.depth) {
        schemas = schemas.map(function (item) {
          return item['@id'];
        });
        return Promise.resolve(schemas);
      } else if (req.query.depth == 'schema') {
        schemas.map(function (schema) {
          schema.supportedBy = schema.supportedBy.map(function (item) {
            if (item.type == 'Federation')
              return settings.baseURL + settings.federations + '/' + item.id;
            else if (item.type == 'Entity')
              return settings.baseURL + settings.entity + '/' + item.id;
          });
          return schema;
        });
        return Promise.resolve(schemas);
      } else if (req.query.depth == 'schema.supportedBy') {
        return Promise.resolve(schemas);
      }
    })
    .then(function (schemas) {
      return callback(null, schemas);
    })
    .catch(function (err) {
      return callback({error: err, code: 404}, null);
    });
};

exports.addSchema = function (req, callback) {
  var valid = ajv.validate(schemaAJVSchema, req.body);
  if (valid) {
    var oSchema = new schemaModel(req.body);
    oSchema.save(function (err, obj) {
      if (err) throw (err);
      callback(null, obj._id);
    });
  } else {
    var errorMsg = Array();
    ajv.errors.forEach(function (element) {
      errorMsg.push(element.message);
    });
    callback({
      error: errorMsg,
      code: 400
    }, null);
  }
};

exports.findSchema = function (req, callback) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return callback({
      error: ['Invalid Schema Id'],
      code: 400
    }, null);
  }

  schemaModel.findById(req.params.id).select('-_id -__v -updatedAt -createdAt')
    .lean()
    .exec(function (err, schema) {
      if (err) throw (err);

      if (!schema) {
        return callback({
          error: ['Schema doesn\'t exist'],
          code: 404
        }, null);
      }
      if (req.query.depth == null) {
        schema.supportedBy = schema.supportedBy.map(function (item) {
          if (item.type == 'Federation')
            return settings.baseURL + settings.federations + '/' + item.id;
          else if (item.type == 'Entity')
            return settings.baseURL + settings.entity + '/' + item.id;
        });
      } else if (req.query.depth == 'supportedBy') {

      } else {
        return callback({
          error: ['unknown value for depth parameter'],
          code: 400
        }, null);
      }

      if (req.query.filter == null)
        callback(null, schema);
      else {
        // Apply jsPath filter here.
        var filterData = JSPath.apply(req.query.filter, schema);
        callback(null, filterData);
      }
    });
};

exports.deleteSchema = function (req, callback) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    callback({
      error: ['Invalid Schema Id'],
      code: 400
    }, null);

  schemaModel.findById(req.params.id)
    .then(function (oSchema) {
      if (!oSchema) {
        return callback({
          error: ['Schema doesn\'t exist'],
          code: 404
        }, null);
      }

      return schemaModel.findOneAndRemove({_id: req.params.id});
    })
    .then(function (oSchema) {
      return callback(null, oSchema);
    })
    .catch(function (err) {
      return callback(err, null);
    });
};

exports.updateSchema = function (req, callback) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    callback({
      error: ['Invalid Schema Id'],
      code: 400
    }, null);

  var valid = ajv.validate(schemaAJVSchema, req.body);
  if (valid) {
    schemaModel.findById(req.params.id)
      .then(function (doc) {
        if (!doc) {
          return callback({
            error: ['Schema doesn\'t exist'],
            code: 404
          }, null);
        }
        return schemaModel.findOneAndUpdate({_id: req.params.id}, req.body);
      })
      .then(function (oParticipant) {
        return callback(null, oParticipant);
      })
      .catch((function (err) {
        throw (err);
      }));
  } else {
    var errorMsg = Array();
    ajv.errors.forEach(function (element) {
      errorMsg.push(element.message);
    });
    callback({
      error: errorMsg,
      code: 400
    }, null);
  }
};

exports.joinSchemaWithFederation = function (req, callback) {
  if (!mongoose.Types.ObjectId.isValid(req.params.fid)) {
    return callback({
      error: ['Invalid Federation Id'],
      code: 400
    }, null);
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.sid)) {
    return callback({
      error: ['Invalid Schema Id'],
      code: 400
    }, null);
  }

  var schema = null;
  var federation = null;
  schemaModel.findById(req.params.sid)
    .then(function (oSchema) {
      if (!oSchema) {
        return Promise.reject({error: 'Schema doesn\'t exist', code: 404});
      }

      oSchema.supportedBy.forEach(function (item) {
        if (item.id == req.params.fid) {
          return Promise.reject({
            error: ['Federation already exist'],
            code: 400
          });
        }
      });

      schema = oSchema;
      return federationModel.findById(req.params.fid);
    })
    .then(function (oFederation) {
      if (!oFederation) {
        return Promise.reject({
          error: ['Federation doesn\'t exist'],
          code: 404
        });
      }
      federation = oFederation;
      if (federation.supports.indexOf(req.params.sid) > -1) {
        return Promise.reject({
          error: ['Schema already exist'],
          code: 400
        });
      }

      federation.supports.push(req.params.sid);
      return federation.save();
    })
    .then(function (oFederation) {
      schema.supportedBy.push({
        id: req.params.fid,
        type: 'Federation'
      });
      return schema.save();
    })
    .then(function (oSchema) {
      return callback(null, oSchema);
    })
    .catch(function (err) {
      return callback({error: err, code: 404}, null);
    });
};

exports.joinSchemaWithEntity = function (req, callback) {
  if (!mongoose.Types.ObjectId.isValid(req.params.eid)) {
    return callback({
      error: ['Invalid Entity Id'],
      code: 400
    }, null);
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.sid)) {
    return callback({
      error: ['Invalid Schema Id'],
      code: 400
    }, null);
  }

  var schema = null;
  var entity = null;
  schemaModel.findById(req.params.sid)
    .then(function (oSchema) {
      if (!oSchema) {
        return Promise.reject({error: 'Schema doesn\'t exist', code: 404});
      }

      oSchema.supportedBy.forEach(function (item) {
        if (item.id == req.params.eid) {
          return Promise.reject({
            error: ['Entity already exist'],
            code: 400
          });
        }
      });

      schema = oSchema;
      return entityModel.findById(req.params.eid);
    })
    .then(function (oEntity) {
      if (!oEntity) {
        return Promise.reject({
          error: ['Entity doesn\'t exist'],
          code: 404
        });
      }
      entity = oEntity;
      if (entity.supports.indexOf(req.params.sid) > -1) {
        return Promise.reject({
          error: ['Schema already exist'],
          code: 400
        });
      }

      entity.supports.push(req.params.sid);
      return entity.save();
    })
    .then(function (oEntity) {
      schema.supportedBy.push({
        id: req.params.eid,
        type: 'Entity'
      });
      return schema.save();
    })
    .then(function (oSchema) {
      return callback(null, oSchema);
    })
    .catch(function (err) {
      return callback({error: err, code: 404}, null);
    });
};
