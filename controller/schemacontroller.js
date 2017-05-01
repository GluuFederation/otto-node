var mongoose = require('mongoose');
var Ajv = require('ajv');
var JSPath = require('jspath');

var schemaModel = require('../models/schemamodel');
var federationModel = require('../models/federationmodel');
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
        return common.customCollectionFilter(schemas, ['supportedBy']);
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
    .populate({path: 'supportedBy', select: '-_id -__v -updatedAt -createdAt'})
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
        schema = common.customObjectFilter(schema, ['supportedBy']);
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

exports.joinSchema = function (req, callback) {
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

      if (oSchema.supportedBy.indexOf(req.params.fid) > -1) {
        return Promise.reject({
          error: ['Federation already exist'],
          code: 400
        });
      }
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
      if (federation.schemas.indexOf(req.params.sid) > -1) {
        return Promise.reject({
          error: ['Schema already exist'],
          code: 400
        });
      }

      federation.schemas.push(req.params.sid);
      return federation.save();
    })
    .then(function (oFederation) {
      schema.supportedBy.push(req.params.fid);
      return schema.save();
    })
    .then(function (oSchema) {
      return callback(null, oSchema);
    })
    .catch(function (err) {
      return callback({error: err, code: 404}, null);
    });
};