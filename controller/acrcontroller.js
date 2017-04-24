var mongoose = require('mongoose');
var Ajv = require('ajv');
var JSPath = require('jspath');

var acrModel = require('../models/acrmodel');
var federationModel = require('../models/federationmodel');
var settings = require('../settings');
var common = require('../helpers/common');

var ajv = Ajv({
  allErrors: true
});

var acrAJVSchema = {
  properties: {
    name: {
      type: 'string'
    }
  },
  required: ['name']
};

exports.getAllACRWithDepth = function (req, callback) {
  var pageNo = +req.query.pageno;
  var pageLength = +req.query.pagelength;
  var depth = '';

  if (!!req.query.depth) {
    depth = [
      {path: 'federatedBy', select: '-_id -__v -updatedAt -createdAt'}
    ];
  }

  acrModel.find({}).select('-_id -__v -updatedAt -createdAt')
    .populate({path: 'supportedBy', select: '-_id -__v -updatedAt -createdAt'})
    .skip((!!pageLength && !!pageNo ? pageNo * pageLength : 0))
    .limit((!!pageLength ? pageLength : 0))
    .populate(depth)
    .lean()
    .then(function (acrs) {
      if (!req.query.depth) {
        acrs = acrs.map(function (item) {
          return item['@id'];
        });
        return Promise.resolve(acrs);
      } else if (req.query.depth == 'acr') {
        return common.customCollectionFilter(acrs, ['supportedBy']);
      } else if (req.query.depth == 'acr.supportedBy') {
        return Promise.resolve(acrs);
      }
    })
    .then(function (acrs) {
      return callback(null, acrs);
    })
    .catch(function (err) {
      return callback({error: err, code: 404}, null);
    });
};

exports.addACR = function (req, callback) {
  var valid = ajv.validate(acrAJVSchema, req.body);
  if (valid) {
    var oACR = new acrModel(req.body);
    oACR.save(function (err, obj) {
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

exports.findACR = function (req, callback) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return callback({
      error: ['Invalid ACR Id'],
      code: 400
    }, null);
  }

  acrModel.findById(req.params.id).select('-_id -__v -updatedAt -createdAt')
    .populate({path: 'supportedBy', select: '-_id -__v -updatedAt -createdAt'})
    .lean()
    .exec(function (err, acr) {
      if (err) throw (err);

      if (!acr) {
        return callback({
          error: ['ACR doesn\'t exist'],
          code: 404
        }, null);
      }
      if (req.query.depth == null) {
        acr.metadata = !!acr.metadata ? acr.metadata['@id'] : '';
        acr = common.customObjectFilter(acr, ['supportedBy']);
      } else if (req.query.depth == 'supportedBy') {

      } else {
        return callback({
          error: ['unknown value for depth parameter'],
          code: 400
        }, null);
      }

      if (req.query.filter == null)
        callback(null, acr);
      else {
        // Apply jsPath filter here.
        var filterData = JSPath.apply(req.query.filter, acr);
        callback(null, filterData);
      }
    });
};

exports.deleteACR = function (req, callback) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    callback({
      error: ['Invalid ACR Id'],
      code: 400
    }, null);

  acrModel.findById(req.params.id)
    .then(function (oACR) {
      if (!oACR) {
        return callback({
          error: ['ACR doesn\'t exist'],
          code: 404
        }, null);
      }

      return acrModel.findOneAndRemove({_id: req.params.id});
    })
    .then(function (oACR) {
      return callback(null, oACR);
    })
    .catch(function (err) {
      return callback(err, null);
    });
};

exports.updateACR = function (req, callback) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    callback({
      error: ['Invalid ACR Id'],
      code: 400
    }, null);

  var valid = ajv.validate(acrAJVSchema, req.body);
  if (valid) {
    acrModel.findById(req.params.id)
      .then(function (doc) {
        if (!doc) {
          return callback({
            error: ['ACR doesn\'t exist'],
            code: 404
          }, null);
        }
        return acrModel.findOneAndUpdate({_id: req.params.id}, req.body);
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

exports.joinACR = function (req, callback) {
  if (!mongoose.Types.ObjectId.isValid(req.params.fid)) {
    return callback({
      error: ['Invalid Federation Id'],
      code: 400
    }, null);
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.aid)) {
    return callback({
      error: ['Invalid ACR Id'],
      code: 400
    }, null);
  }

  var acr = null;
  acrModel.findById(req.params.aid)
    .then(function (oACR) {
      if (!oACR) {
        return Promise.reject({error: 'ACR doesn\'t exist', code: 404});
      }

      if (oACR.supportedBy.indexOf(req.params.fid) > -1) {
        return Promise.reject({
          error: ['Federation already exist'],
          code: 400
        });
      }
      acr = oACR;
      return federationModel.findById(req.params.fid);
    })
    .then(function (docs) {
      if (!docs) {
        return Promise.reject({
          error: ['Federation doesn\'t exist'],
          code: 404
        });
      }
      acr.supportedBy.push(req.params.fid);
      return acr.save();
    })
    .then(function (oACR) {
      return callback(null, oACR);
    })
    .catch(function (err) {
      return callback({error: err, code: 404}, null);
    });
};