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

var baseURL = settings.baseURL;
var FederationURL = settings.federations;
var ajv = Ajv({
  allErrors: true
});
var possibleDepthArr = ['federations', 'federations.entities', 'federations.organization', 'federations.entities.organization'];
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
  federationModel.find({}).select('-_id -__v')
    .populate({
      path: 'federates',
      select: '-_id -__v'
    })
    .populate({path: 'members', select: '-_id -__v'})
    .lean()
    .exec(function (err, federations) {
      if (err) throw (err);

      callback(null, federations);
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

  federationModel.findById(req.params.id).select('-_id -__v')
    .populate({
      path: 'federates',
      select: '-_id -__v'
    })
    .populate({path: 'members', select: '-_id -__v'})
    .lean()
    .exec(function (err, federation) {
      if (err) throw (err);

      if (!federation) {
        return callback({
          error: ['Federation doesn\'t exist'],
          code: 404
        }, null);
      }
      if (req.query.depth == null) {
        federation.federates = federation.federates.map(function (item, index) {
          return item['@id'];
        });
        federation.members = federation.members.map(function (item, index) {
          return item['@id'];
        });
      } else if (req.query.depth == 'federates') {
        federation.members = federation.members.map(function (item, index) {
          return settings.baseURL + settings.participant + '/' + item;
        });
      } else if (req.query.depth == 'members') {
        federation.federates = federation.federates.map(function (item, index) {
          return item['@id'];
        });
      } else if (req.query.depth == 'federates,members') {
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
    return Promise.reject(callback({
      error: ['Invalid Federation Id'],
      code: 400
    }, null));
  }

  federationModel.findById(req.params.id)
    .then(function (oFederation) {
      if (!oFederation) {
        return Promise.reject(callback({
          error: ['Federation doesn\'t exist'],
          code: 404
        }, null));
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
          return Promise.reject(callback({
            error: ['Federation doesn\'t exist'],
            code: 404
          }, null));
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
        return Promise.reject(callback({error: 'Federation doesn\'t exist', code: 404}, null));
      }

      if (oFederation.federates.indexOf(req.params.eid) > -1) {
        return Promise.reject(callback({
          error: ['Entity already exist'],
          code: 400
        }, null));
      }
      federation = oFederation;
      return entityModel.findById(req.params.eid);
    })
    .then(function (docs) {
      if (!docs) {
        return Promise.reject(callback({
          error: ['Entity doesn\'t exist'],
          code: 404
        }, null));
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
        return Promise.reject(callback({
          error: ['Federation doesn\'t exist'],
          code: 404
        }, null));
      }
      console.log(doc.federates, req.params.eid);
      var index = doc.federates.indexOf(req.params.eid);
      if (index == -1) {
        return Promise.reject(callback({
          error: ['Entity doesn\'t exist in Federation'],
          code: 404
        }, null));
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
      error: ['Invalid Organization Id'],
      code: 400
    }, null);
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.pid)) {
    return callback({
      error: ['Invalid Federation Id'],
      code: 400
    }, null);
  }

  federationModel.findById(req.params.fid)
    .then(function (oFederation) {
      if (!oFederation) {
        return callback({
          error: ['Federation doesn\'t exists'],
          code: 404
        }, null);
      }

      if (oFederation.members.indexOf(req.params.pid) > -1) {
        return callback({
          error: ['Federation already exist'],
          code: 404
        }, null);
      }

      oFederation.members.push(req.params.pid);
      return oFederation.save();
    })
    .then(function (oFederation) {
      return callback(null, oFederation);
    })
    .catch(function (err) {
      return callback({error: err, code: 404}, null);
    });
};