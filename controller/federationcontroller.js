var Guid = require('guid');
var mongoose = require('mongoose');
var keypair = require('keypair');
var pem2jwk = require('pem-jwk').pem2jwk;
var Ajv = require('ajv');

var settings = require('../settings');
var federationModel = require('../models/federationmodel');
var entityModel = require('../models/entitymodel');
var metadataModel = require('../models/metadatamodel');
var common = require('../helpers/common');

var ajv = Ajv({
  allErrors: true
});
var FederationAJVSchema = {
  properties: {
    name: {
      type: 'string'
    },
    registeredBy: {
      type: 'string'
    },
    sponsor: {
      type: 'string'
    }
  },
  required: ['name', 'registeredBy', 'sponsor']
};

exports.getAllFederationWithDepth = function (req, callback) {
  var pageNo = (+req.query.pageno);
  pageNo = pageNo > 0 ? pageNo -= 1 : pageNo;

  var pageLength = +req.query.pagelength;
  var depth = '';

  if (!!req.query.depth) {
    depth = [
      'sponsor',
      'sponsor.registeredBy',
      'sponsor.memberOf',
      'sponsor.operates',
      'sponsor.badgeSupported',
      'federates',
      'federates.metadata',
      'federates.registeredBy',
      'federates.federatedBy',
      'federates.supports',
      'member',
      'member.registeredBy',
      'member.badgeSupported',
      'member.memberOf',
      'badgeSupported',
      'supports',
      'metadata',
      'registeredBy'
    ];
  }

  var totalResults = 0;
  federationModel
    .find({})
    .lean()
    .then(function (federations) {
      totalResults = federations.length;
      if (totalResults / pageLength < pageNo) {
        return Promise.reject({error: ['Invalid page no'], code: 400});
      }

      return federationModel.find({}).select('-_id -__v -updatedAt -createdAt')
        .skip((!!pageLength && !!pageNo ? pageNo * pageLength : 0))
        .limit((!!pageLength ? pageLength : 0))
        .deepPopulate(depth)
        .lean();
    })
    .then(function (federations) {
      if (federations.length <= 0) {
        return Promise.reject({error: ['No records found'], code: 404});
      }

      federations.forEach(function (item) {
        item.registeredBy = !!item.registeredBy ? item.registeredBy['@id'] : '';
      });

      if (!req.query.depth) {
        federations = federations.map(function (item) {
          return item['@id'];
        });
        return Promise.resolve(federations);
      } else if (req.query.depth == 'federations') {
        return common.customCollectionFilter(federations, ['member', 'federates', 'sponsor', 'supports', 'metadata', 'badgeSupported']);
      } else {
        return Promise.reject({error: ['Invalid depth parameter'], code: 400});
      }
    })
    .then(function (federations) {
      return callback(null, {
        federations: federations,
        totalResults: totalResults,
        itemsPerPage: (!!pageLength ? pageLength : 0),
        startIndex: (!!pageNo ? pageNo + 1 : 1)
      });
    })
    .catch(function (err) {
      return callback(err, null);
    });
};

exports.addFederation = function (req, callback) {

  var valid = ajv.validate(FederationAJVSchema, req.body);
  if (valid) {
    var oFederation = new federationModel(req.body);
    oFederation.save(function (err, obj) {
      if (err) {
        if (!!err.code && err.code == 11000) {
          return callback({error: ['Federation with same name already exist'], code: 400}, null);
        }
        return callback({error: err, code: 404}, null);
      }

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
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return callback({
      error: ['Invalid Federation Id'],
      code: 400
    }, null);
  }

  federationModel.findById(req.params.id).select('-_id -__v -updatedAt -createdAt')
    .deepPopulate([
      'sponsor',
      'sponsor.registeredBy',
      'sponsor.memberOf',
      'sponsor.operates',
      'sponsor.badgeSupported',
      'federates',
      'federates.metadata',
      'federates.registeredBy',
      'federates.federatedBy',
      'federates.supports',
      'member',
      'member.registeredBy',
      'member.badgeSupported',
      'member.memberOf',
      'badgeSupported',
      'supports',
      'metadata',
      'registeredBy'
    ])
    .lean()
    .exec()
    .then(function (federation) {
      if (!federation) {
        return Promise.reject({
          error: ['Federation doesn\'t exist'],
          code: 404
        });
      }
      federation.registeredBy = federation.registeredBy['@id'];
      federation = common.customObjectFilter(federation, ['sponsor', 'member', 'federates', 'badgeSupported', 'supports', 'metadata']);
      if (req.query.depth == null) {
        return Promise.resolve(federation);
      } else {
        return common.depth(federation, req.query.depth)
          .then(function (depthFed) {
            return Promise.resolve(depthFed);
          });
      }
    })
    .then(function (federation) {
      if (req.query.filter == null)
        callback(null, federation);
      else {
        try {
          var data = common.jsPathFilter(req.query.filter, federation);
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
    return callback({
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
      return callback(err, null);
    });
};

exports.updateFederation = function (req, callback) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return callback({
      error: ['Invalid Federation Id'],
      code: 400
    }, null);
  }

  var valid = true; //ajv.validate(FederationAJVSchema, req.body);
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
        return Promise.reject({error: ['Federation doesn\'t exist'], code: 404});
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
      return callback(err, null);
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
      return callback(err, null);
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
      return callback(err, null);
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
      return callback(err, null);
    });
};

exports.addMetadata = function (req, callback) {
  if (!mongoose.Types.ObjectId.isValid(req.params.fid)) {
    return callback({
      error: ['Invalid Federation Id'],
      code: 400
    }, null);
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.mid)) {
    return callback({
      error: ['Invalid metadata Id'],
      code: 400
    }, null);
  }

  var federation = null;
  federationModel.findById(req.params.fid)
    .then(function (oFederation) {
      if (!oFederation) {
        return Promise.reject({error: ['Federation doesn\'t exist'], code: 404});
      }

      if (oFederation.metadata.indexOf(req.params.mid) > -1) {
        return Promise.reject({
          error: ['Metadata already exist'],
          code: 400
        });
      }
      federation = oFederation;
      return metadataModel.findById(req.params.mid);
    })
    .then(function (docs) {
      if (!docs) {
        return Promise.reject({
          error: ['Metadata doesn\'t exist'],
          code: 404
        });
      }
      federation.metadata.push(req.params.mid);
      return federation.save();
    })
    .then(function (oFederation) {
      return callback(null, oFederation);
    })
    .catch(function (err) {
      return callback(err, null);
    });
};

exports.patchFederation = function (req, callback) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return callback({
      error: ['Invalid Federation Id'],
      code: 400
    }, null);
  }

  if (!req.body.op) {
    return callback({
      error: ['op property must required'],
      code: 400
    }, null);
  }

  return federationModel.findById(req.params.id)
    .then(function (federation) {
      if (!federation) {
        return Promise.reject({
          error: ['Federation doesn\'t exist'],
          code: 404
        });
      }

      if (req.body.op == 'add') {
        return common.patchAdd(req.body, federation);
      } else if (req.body.op == 'replace') {
        return common.patchReplace(req.body, federation);
      } else if (req.body.op == 'remove') {
        return common.patchRemove(req.body, federation);
      }
    })
    .then(function (oFederation) {
      return callback(null, oFederation);
    })
    .catch((function (err) {
      return callback(err, null);
    }));
};