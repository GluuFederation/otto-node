var JSPath = require('jspath');
var Guid = require('guid');
var mongoose = require('mongoose');
var keypair = require('keypair');
var pem2jwk = require('pem-jwk').pem2jwk;
var Transaction = require('mongoose-transaction')(mongoose);
var Ajv = require('ajv');

var settings = require('../settings');
var federationModel = require('../models/federationmodel');
var entityModel = require('../models/entitymodel');
var raModel = require('../models/ramodel');
var metadataModel = require('../models/metadatamodel');
var common = require('../helpers/common');

var ajv = Ajv({
  allErrors: true
});
var FederationAJVSchema = {
  properties: {
    name: {
      type: 'string'
    }
  },
  required: ['name']
};

exports.getAllFederationWithDepth = function (req, callback) {
  var pageNo = +req.query.pageno;
  var pageLength = +req.query.pagelength;
  var depth = '';

  if (!!req.query.depth) {
    depth = [
      {path: 'sponsor', select: '-_id -__v -updatedAt -createdAt'},
      {path: 'federates', select: '-_id -__v -updatedAt -createdAt'},
      {path: 'member', select: '-_id -__v -updatedAt -createdAt'},
      {path: 'registeredBy', select: '-_id -__v -updatedAt -createdAt'}
    ];
  }

  federationModel.find({}).select('-_id -__v -updatedAt -createdAt')
    .skip((!!pageLength && !!pageNo ? pageNo * pageLength : 0))
    .limit((!!pageLength ? pageLength : 0))
    .populate(depth)
    .lean()
    .then(function (federations) {
      federations.forEach(function (item) {
        item.registeredBy = !!item.registeredBy ? item.registeredBy['@id'] : '';
      });

      if (!req.query.depth) {
        federations = federations.map(function (item) {
          return item['@id'];
        });
        return Promise.resolve(federations);
      } else if (req.query.depth == 'federations') {
        return common.customCollectionFilter(federations, ['member', 'federates', 'sponsor']);
      } else if (req.query.depth == 'federations.federates') {
        return common.customCollectionFilter(federations, ['member', 'sponsor']);
      } else if (req.query.depth == 'federations.member') {
        return common.customCollectionFilter(federations, ['sponsor', 'federates']);
      } else if (req.query.depth == 'federations.sponsor') {
        return common.customCollectionFilter(federations, ['federates', 'member']);
      }
    })
    .then(function (federationss) {
      return callback(null, federationss);
    })
    .catch(function (err) {
      return callback({error: err, code: 404}, null);
    });
};

exports.addFederation = function (req, callback) {

  var valid = ajv.validate(FederationAJVSchema, req.body);
  if (valid) {
    var oFederation = new federationModel(req.body);
    oFederation.save(function (err, obj) {
      if (err) throw (err)
      // createKeyPairAndAddtoFederation(ObjfederationModel._id, 'RS256', function (err, data) {
      //   console.log("Err :" + err);
      //   console.log("Data :" + data);
      // });
      //
      // createKeyPairAndAddtoFederation(ObjfederationModel._id, 'RS384', function (err, data) {
      //   console.log("Err :" + err);
      //   console.log("Data :" + data);
      // });
      //
      // createKeyPairAndAddtoFederation(ObjfederationModel._id, 'RS512', function (err, data) {
      //   console.log("Err :" + err);
      //   console.log("Data :" + data);
      // });
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

function createKeyPairAndAddtoFederation(fid, alg, callback) {
  if (!mongoose.Types.ObjectId.isValid(fid))
    callback({
      error: ['Invalid Federation Id'],
      code: 400
    }, null);

  federationModel.findOne({
    _id: fid
  }, function (err, fed) {

    if (err)
      callback(err, null);
    var pair = keypair();
    var doc = {};
    doc.privatekey = pair.private;
    doc.publickey = pair.public;
    doc.keyguid = Guid.raw();
    doc.alg = alg;

    fed.keys.push(doc);
    fed.save();
    callback(null, fed);
  });
}

exports.findFederation = function (req, callback) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return callback({
      error: ['Invalid Federation Id'],
      code: 400
    }, null);

  federationModel.findById(req.params.id).select('-_id -__v -updatedAt -createdAt')
    .populate({
      path: 'federates',
      select: '-_id -__v'
    })
    .populate({path: 'member', select: '-_id -__v'})
    .populate({path: 'sponsor', select: '-_id -__v'})
    .populate({path: 'badgeSupported', select: '-_id -__v'})
    .populate({path: 'requirement', select: '-_id -__v'})
    .populate({path: 'registeredBy', select: {'@id': 1, name: 1, _id: 0}})
    .lean()
    .exec(function (err, federation) {
      if (err) throw (err);

      if (!federation) {
        return callback({
          error: ['Federation doesn\'t exist'],
          code: 404
        }, null);
      }
      federation.registeredBy = federation.registeredBy['@id'];
      if (req.query.depth == null) {
        federation = common.customObjectFilter(federation, ['sponsor', 'member', 'federates', 'badgeSupported', 'requirement']);
      } else if (req.query.depth == 'federates') {
        federation = common.customObjectFilter(federation, ['sponsor', 'member', 'badgeSupported', 'requirement']);
      } else if (req.query.depth == 'member') {
        federation = common.customObjectFilter(federation, ['sponsor', 'federates', 'badgeSupported', 'requirement']);
      } else if (req.query.depth == 'sponsor') {
        federation = common.customObjectFilter(federation, ['member', 'federates', 'badgeSupported', 'requirement']);
      } else if (req.query.depth == 'federates,member,sponsor') {
      } else {
        return callback({
          error: ['unknown value for depth parameter'],
          code: 400
        }, null);
      }

      if (req.query.filter == null)
        callback(null, federation);
      else {
        // Apply jsPath filter here.
        var filterData = JSPath.apply(req.query.filter, federation);
        callback(null, filterData);
      }
    });
};

exports.getJWKsForFederation = function (req, callback) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    callback({
      error: ['Invalid Federation Id'],
      code: 400
    }, null);

  federationModel.findOne({
    _id: req.params.id
  }, "keys", function (err, doc) {
    if (doc.keys == undefined || doc.keys == null)
      callback({
        error: ['Keys not available for federation'],
        code: 400
      }, null);

    var jwks = [];
    for (var i = 0; i < doc.keys.length; i++) {
      var jwk = pem2jwk(doc.keys[i].publickey);
      jwk.alg = doc.keys[i].alg;
      jwk.use = 'sign';
      jwk.kid = doc.keys[i].keyguid;
      jwks.push(jwk);
    }
    callback(null, {jwks: jwks});
  });
};

exports.deleteFederation = function (req, callback) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return Promise.reject({
      error: ['Invalid Federation Id'],
      code: 400
    });
  }

  federationModel.findById(req.params.id)
    .then(function (oFederation) {
      if (!oFederation) {
        return Promise.reject({
          error: ['Federation doesn\'t exist'],
          code: 404
        });
      }

      return federationModel.findOneAndRemove({_id: req.params.id});
    })
    .then(function (oFederation) {
      return callback(null, oFederation);
    })
    .catch(function (err) {
      return callback({error: err, code: 404}, null);
    });
};

exports.updateFederation = function (req, callback) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    callback({
      error: ['Invalid Federation Id'],
      code: 400
    }, null);

  var valid = ajv.validate(FederationAJVSchema, req.body);
  if (valid) {
    federationModel.findById(req.params.id)
      .then(function (doc) {
        if (!doc) {
          return Promise.reject({
            error: ['Federation doesn\'t exist'],
            code: 404
          });
        }
        return federationModel.findOneAndUpdate({_id: req.params.id}, req.body);
      })
      .then(function (oFederation) {
        return callback(null, oFederation);
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

exports.joinFederation = function (req, callback) {
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
  var federation = null;
  federationModel.findById(req.params.fid)
    .then(function (oFederation) {
      if (!oFederation) {
        return Promise.reject({error: 'Federation doesn\'t exist', code: 404});
      }

      if (oFederation.federates.indexOf(req.params.eid) > -1) {
        return Promise.reject({
          error: ['Entity already exist'],
          code: 400
        });
      }
      federation = oFederation;
      return entityModel.findById(req.params.eid);
    })
    .then(function (docs) {
      if (!docs) {
        return Promise.reject({
          error: ['Entity doesn\'t exist'],
          code: 404
        });
      }
      federation.federates.push(req.params.eid);
      return federation.save();
    })
    .then(function (oFederation) {
      return callback(null, oFederation);
    })
    .catch(function (err) {
      return callback({error: err, code: 404}, null);
    });
};

exports.leaveFederation = function (req, callback) {
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

  federationModel.findById(req.params.fid)
    .then(function (doc) {
      if (!doc) {
        return Promise.reject({
          error: ['Federation doesn\'t exist'],
          code: 404
        });
      }
      var index = doc.federates.indexOf(req.params.eid);
      if (index == -1) {
        return Promise.reject({
          error: ['Entity doesn\'t exist in Federation'],
          code: 404
        });
      }
      doc.federates.splice(index, 1);
      return doc.save();
    })
    .then(function (oFederation) {
      return callback(null, oFederation);
    })
    .catch(function (err) {
      return callback({error: err, code: 404}, null);
    });
};

exports.addParticipant = function (req, callback) {
  if (!mongoose.Types.ObjectId.isValid(req.params.fid)) {
    return callback({
      error: ['Invalid Federation Id'],
      code: 400
    }, null);
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.pid)) {
    return callback({
      error: ['Invalid Participant Id'],
      code: 400
    }, null);
  }

  federationModel.findById(req.params.fid)
    .then(function (oFederation) {
      if (!oFederation) {
        return Promise.reject({
          error: ['Federation doesn\'t exist'],
          code: 404
        });
      }
      if (oFederation.member.indexOf(req.params.pid) > -1) {
        return Promise.reject({
          error: ['Participant already exist'],
          code: 404
        });
      }

      oFederation.member.push(req.params.pid);
      return oFederation.save();
    })
    .then(function (oFederation) {
      return callback(null, oFederation);
    })
    .catch(function (err) {
      return callback({error: err, code: 404}, null);
    });
};

exports.addSponsor = function (req, callback) {
  if (!mongoose.Types.ObjectId.isValid(req.params.fid)) {
    return callback({
      error: ['Invalid Federation Id'],
      code: 400
    }, null);
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.pid)) {
    return callback({
      error: ['Invalid Participant Id'],
      code: 400
    }, null);
  }

  federationModel.findById(req.params.fid)
    .then(function (oFederation) {
      if (!oFederation) {
        return Promise.reject({
          error: ['Federation doesn\'t exist'],
          code: 404
        });
      }

      if (oFederation.sponsor.indexOf(req.params.pid) > -1) {
        return Promise.reject({
          error: ['Participant already exist'],
          code: 404
        });
      }

      oFederation.sponsor.push(req.params.pid);
      return oFederation.save();
    })
    .then(function (oFederation) {
      return callback(null, oFederation);
    })
    .catch(function (err) {
      return callback({error: err, code: 404}, null);
    });
};