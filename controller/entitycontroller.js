var mongoose = require('mongoose');
var Ajv = require('ajv');
var JSPath = require('jspath');

var entityModel = require('../models/entitymodel');
var federationModel = require('../models/federationmodel');
var participantModel = require('../models/participantmodel');
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
    },
    registeredBy: {
      type: 'string'
    }
  },
  required: ['name', 'registeredBy']
};

exports.getAllEntityWithDepth = function (req, callback) {
  var pageNo = (+req.query.pageno);
  pageNo = pageNo > 0 ? pageNo-=1 : pageNo;

  var pageLength = +req.query.pagelength;
  var depth = '';

  if (!!req.query.depth) {
    depth = [
      'registeredBy',
      'federatedBy',
      'metadata',
      'supports'
    ]
  }
  var totalResults = 0;
  entityModel
    .find({})
    .lean()
    .then(function (entities) {
      totalResults = entities.length;
      if (totalResults/pageLength < pageNo) {
        return Promise.reject({error: ['Invalid page no'], code: 400});
      }

      return entityModel.find({}).select('-_id -__v -updatedAt -createdAt')
        .skip((!!pageLength && !!pageNo ? pageNo * pageLength : 0))
        .limit((!!pageLength ? pageLength : 0))
        .deepPopulate(depth)
        .lean();
    })
    .then(function (entities) {
      if (entities.length <= 0) {
        return Promise.reject({error: ['No records found'], code: 404});
      }

      entities.forEach(function (item) {
        item.registeredBy = !!item.registeredBy ? item.registeredBy['@id'] : '';
      });

      if (!req.query.depth) {
        entities = entities.map(function (item) {
          return item['@id'];
        });
        return Promise.resolve(entities);
      } else if (req.query.depth == 'entity') {
        entities.forEach(function (item) {
          item.metadata = !!item.metadata ? item.metadata['@id'] : '';

          if (!!item.operatedBy && item.operatedBy.type == 'federation')
            item.operatedBy = settings.baseURL + settings.federations + '/' + item.operatedBy.id;
          else if (!!item.operatedBy && item.operatedBy.type == 'participant')
            item.operatedBy = settings.baseURL + settings.participant + '/' + item.operatedBy.id;
        });

        return common.customCollectionFilter(entities, ['federatedBy', 'supports']);
      } else {
        return Promise.reject({error: ['Invalid depth parameter'], code: 400});
      }
    })
    .then(function (entities) {
      return callback(null, {entity: entities, totalResults: totalResults, itemsPerPage:(!!pageLength ? pageLength : 0), startIndex: (!!pageNo?pageNo+1:1)});
    })
    .catch(function (err) {
      return callback(err, null);
    });
};

exports.addEntity = function (req, callback) {
  var valid = ajv.validate(entityAJVSchema, req.body);
  if (valid) {
    var oEntity = new entityModel(req.body);
    oEntity.save(function (err, obj) {
      if (err) {
        if (!!err.code && err.code == 11000) {
          return callback({error: ['Entity with same name already exist'], code: 404}, null);
        }
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
    .deepPopulate([
      'registeredBy',
      'federatedBy',
      'federatedBy.registeredBy',
      'federatedBy.sponsor',
      'federatedBy.federates',
      'federatedBy.member',
      'federatedBy.badgeSupported',
      'federatedBy.supports',
      'federatedBy.metadata',
      'metadata',
      'supports'
    ])
    .lean()
    .exec()
    .then(function (entity) {
      if (!entity) {
        return Promise.reject({
          error: ['Entity doesn\'t exist'],
          code: 404
        });
      }
      entity.registeredBy = entity.registeredBy['@id'];
      if (!!entity.operatedBy && entity.operatedBy.type == 'federation')
        entity.operatedBy = settings.baseURL + settings.federations + '/' + entity.operatedBy.id;
      else if (!!entity.operatedBy && entity.operatedBy.type == 'participant')
        entity.operatedBy = settings.baseURL + settings.participant + '/' + entity.operatedBy.id;

      entity.metadata = !!entity.metadata ? entity.metadata['@id'] : '';
      entity = common.customObjectFilter(entity, ['federatedBy', 'supports']);

      if (req.query.depth == null) {
        return Promise.resolve(entity);
      } else {
        return common.depth(entity, req.query.depth)
          .then(function (depthEntity) {
            return Promise.resolve(depthEntity);
          });
      }
    })
    .then(function (entity) {
      if (req.query.filter == null)
        callback(null, entity);
      else {
        try {
          var data = common.jsPathFilter(req.query.filter, entity);
          callback(null, data);
        } catch (e) {
          return callback({
            error: ['Invalid jspath'],
            code: 400
          }, null);
        }
      }
    })
    .catch(function (err) {
      return callback(err, null);
    });
};

exports.deleteEntity = function (req, callback) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return callback({
      error: ['Invalid Entity Id'],
      code: 400
    }, null);
  }

  entityModel.findById(req.params.id)
    .then(function (oEntity) {
      if (!oEntity) {
        return Promise.reject({
          error: ['Entity doesn\'t exist'],
          code: 404
        });
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
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return callback({
      error: ['Invalid Entity Id'],
      code: 400
    }, null);
  }

  var valid = true; //ajv.validate(entityAJVSchema, req.body);
  if (valid) {
    entityModel.findById(req.params.id)
      .then(function (doc) {
        if (!doc) {
          return Promise.reject({
            error: ['Entity doesn\'t exist'],
            code: 404
          });
        }
        return entityModel.findOneAndUpdate({_id: req.params.id}, req.body);
      })
      .then(function (oParticipant) {
        return callback(null, oParticipant);
      })
      .catch((function (err) {
        return callback(err, null);
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
        return Promise.reject({error: ['Entity doesn\'t exist'], code: 404});
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
      return callback(err, null);
    });
};

exports.setFederationAsOperator = function (req, callback) {
  if (!mongoose.Types.ObjectId.isValid(req.params.eid)) {
    return callback({
      error: ['Invalid Entity Id'],
      code: 400
    }, null);
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return callback({
      error: ['Invalid Id'],
      code: 400
    }, null);
  }

  var entity = null;
  entityModel.findById(req.params.eid)
    .then(function (oEntity) {
      if (!oEntity) {
        return Promise.reject({error: ['Entity doesn\'t exist'], code: 404});
      }

      entity = oEntity;
      return federationModel.findById(req.params.id);
    })
    .then(function (oFederation) {
      if (!oFederation) {
        return Promise.reject({
          error: ['Federation doesn\'t exist'],
          code: 404
        });
      }

      entity.operatedBy = {
        id: req.params.id,
        type: 'federation'
      };
      return entity.save();
    })
    .then(function (oEntity) {
      return callback(null, oEntity);
    })
    .catch(function (err) {
      return callback(err, null);
    });
};

exports.setParticipantAsOperator = function (req, callback) {
  if (!mongoose.Types.ObjectId.isValid(req.params.eid)) {
    return callback({
      error: ['Invalid Entity Id'],
      code: 400
    }, null);
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return callback({
      error: ['Invalid Id'],
      code: 400
    }, null);
  }

  var entity = null;
  entityModel.findById(req.params.eid)
    .then(function (oEntity) {
      if (!oEntity) {
        return Promise.reject({error: ['Entity doesn\'t exist'], code: 404});
      }

      oEntity.operatedBy.forEach(function (item) {
        if (item.id == req.params.id) {
          return Promise.reject({
            error: ['Federation already exist'],
            code: 400
          });
        }
      });

      entity = oEntity;
      return participantModel.findById(req.params.id);
    })
    .then(function (oParticipant) {
      if (!oParticipant) {
        return Promise.reject({
          error: ['Participant doesn\'t exist'],
          code: 404
        });
      }

      entity.operatedBy.push({
        id: req.params.id,
        type: 'participant'
      });
      return entity.save();
    })
    .then(function (oEntity) {
      return callback(null, oEntity);
    })
    .catch(function (err) {
      return callback(err, null);
    });
};

exports.patchEntity = function (req, callback) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return callback({
      error: ['Invalid Entity Id'],
      code: 400
    }, null);
  }

  if (!req.body.op) {
    return callback({
      error: ['op property must required'],
      code: 400
    }, null);
  }

  return entityModel.findById(req.params.id)
    .then(function (entity) {
      if (!entity) {
        return Promise.reject({
          error: ['Entity doesn\'t exist'],
          code: 404
        });
      }

      if (req.body.op == 'add') {
        return common.patchAdd(req.body, entity);
      } else if (req.body.op == 'replace') {
        return common.patchReplace(req.body, entity);
      } else if (req.body.op == 'remove') {
        return common.patchRemove(req.body, entity);
      }
    })
    .then(function (oEntity) {
      return callback(null, oEntity);
    })
    .catch((function (err) {
      return callback(err, null);
    }));
};