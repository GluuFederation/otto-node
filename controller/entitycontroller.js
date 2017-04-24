var mongoose = require('mongoose');
var Ajv = require('ajv');
var JSPath = require('jspath');

var entityModel = require('../models/entitymodel');
var federationModel = require('../models/federationmodel');
var settings = require('../settings');
var common = require('../helpers/common');

var ajv = Ajv({
  allErrors: true
});

var baseURL = settings.baseURL;
var entityURL = settings.entity;

var entityAJVSchema = {
  properties: {
    name: {
      type: 'string'
    }
  },
  required: ['name']
};

exports.getAllEntityWithDepth = function (req, callback) {
  var pageNo = +req.query.pageno;
  var pageLength = +req.query.pagelength;
  var depth = '';

  if (!!req.query.depth) {
    depth = [
      {path: 'metadata', select: '-_id -__v -updatedAt -createdAt'},
      {path: 'federatedBy', select: '-_id -__v -updatedAt -createdAt'},
      {path: 'registeredBy', select: '-_id -__v -updatedAt -createdAt'}
    ];
  }

  entityModel.find({}).select('-_id -__v -updatedAt -createdAt')
    .skip((!!pageLength && !!pageNo ? pageNo * pageLength : 0))
    .limit((!!pageLength ? pageLength : 0))
    .populate(depth)
    .lean()
    .then(function (entities) {
      entities.forEach(function (item) {
        item.registeredBy = !!item.registeredBy ? item.registeredBy['@id'] : '';
      });

      if (!req.query.depth) {
        entities = entities.map(function (item) {
          return item['@id'];
        });
        return Promise.resolve(entities);
      } else if (req.query.depth == 'entities') {
        entities.forEach(function (item) {
          item.metadata = !!item.metadata ? item.metadata['@id'] : '';
        });

        return common.customCollectionFilter(entities, ['federatedBy']);
      } else if (req.query.depth == 'entities.federatedBy') {
        entities.forEach(function (item) {
          item.metadata = !!item.metadata ? item.metadata['@id'] : '';
        });

        return Promise.resolve(entities);
      } else if (req.query.depth == 'entities.metadata') {
        return common.customCollectionFilter(entities, ['federatedBy']);
      }
    })
    .then(function (entities) {
      return callback(null, entities);
    })
    .catch(function (err) {
      return callback({error: err, code: 404}, null);
    });
};

exports.addEntity = function (req, callback) {
  var valid = ajv.validate(entityAJVSchema, req.body);
  if (valid) {
    var oEntity = new entityModel(req.body);
    oEntity.save(function (err, obj) {
      if (err) {
        return callback({error: err, code: 404}, null);
      }
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

exports.findEntity = function (req, callback) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return callback({
      error: ['Invalid Entity Id'],
      code: 400
    }, null);
  }

  entityModel.findById(req.params.id).select('-_id -__v -updatedAt -createdAt')
    .populate({path: 'metadata', select: '-_id -__v -updatedAt -createdAt'})
    .populate({path: 'federatedBy', select: '-_id -__v -updatedAt -createdAt'})
    .populate({path: 'registeredBy', select: {'@id': 1, name: 1, _id: 0}})
    .lean()
    .exec(function (err, entity) {
      if (err) throw (err);

      if (!entity) {
        return callback({
          error: ['Entity doesn\'t exist'],
          code: 404
        }, null);
      }
      entity.registeredBy = entity.registeredBy['@id'];
      if (req.query.depth == null) {
        entity.metadata = !!entity.metadata ? entity.metadata['@id'] : '';
        entity = common.customObjectFilter(entity, ['federatedBy']);
      } else if (req.query.depth == 'metadata') {
        entity = common.customObjectFilter(entity, ['federatedBy']);
      } else if (req.query.depth == 'federatedBy') {
        entity.metadata = !!entity.metadata ? entity.metadata['@id'] : '';
      } else if (req.query.depth == 'metadata,federatedBy') {
      } else {
        return callback({
          error: ['unknown value for depth parameter'],
          code: 400
        }, null);
      }

      if (req.query.filter == null)
        callback(null, entity);
      else {
        // Apply jsPath filter here.
        var filterData = JSPath.apply(req.query.filter, entity);
        callback(null, filterData);
      }
    });
};

exports.deleteEntity = function (req, callback) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    callback({
      error: ['Invalid Entity Id'],
      code: 400
    }, null);

  entityModel.findById(req.params.id)
    .then(function (oEntity) {
      if (!oEntity) {
        return callback({
          error: ['Entity doesn\'t exist'],
          code: 404
        }, null);
      }

      return entityModel.findOneAndRemove({_id: req.params.id});
    })
    .then(function (oEntity) {
      return callback(null, oEntity);
    })
    .catch(function (err) {
      return callback(err, null);
    });
};

exports.updateEntity = function (req, callback) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    callback({
      error: ['Invalid Entity Id'],
      code: 400
    }, null);

  var valid = ajv.validate(entityAJVSchema, req.body);
  if (valid) {
    entityModel.findById(req.params.id)
      .then(function (doc) {
        if (!doc) {
          return callback({
            error: ['Entity doesn\'t exist'],
            code: 404
          }, null);
        }
        return entityModel.findOneAndUpdate({_id: req.params.id}, req.body);
      })
      .then(function (oParticipant) {
        return callback(null, oParticipant);
      })
      .catch((function (err) {
        return callback({error: err, code: 404}, null);
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

exports.joinEntity = function (req, callback) {
  if (!mongoose.Types.ObjectId.isValid(req.params.fid)) {
    return callback({
      error: ['Invalid Federation Id'],
      code: 400
    }, null);
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.eid)) {
    return callback({
      error: ['Invalid Entity Id'],
      code: 400
    }, null);
  }

  var entity = null;
  entityModel.findById(req.params.eid)
    .then(function (oEntity) {
      if (!oEntity) {
        return Promise.reject({error: 'Entity doesn\'t exist', code: 404});
      }

      if (oEntity.federatedBy.indexOf(req.params.fid) > -1) {
        return Promise.reject({
          error: ['Federation already exist'],
          code: 400
        });
      }
      entity = oEntity;
      return federationModel.findById(req.params.fid);
    })
    .then(function (docs) {
      if (!docs) {
        return Promise.reject({
          error: ['Federation doesn\'t exist'],
          code: 404
        });
      }
      entity.federatedBy.push(req.params.fid);
      return entity.save();
    })
    .then(function (oEntity) {
      return callback(null, oEntity);
    })
    .catch(function (err) {
      return callback({error: err, code: 404}, null);
    });
};