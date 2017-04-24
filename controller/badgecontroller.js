var mongoose = require('mongoose');
var Ajv = require('ajv');
var JSPath = require('jspath');

var badgeModel = require('../models/badgemodel');
var participantModel = require('../models/participantmodel');
var settings = require('../settings');
var common = require('../helpers/common');

var ajv = Ajv({
  allErrors: true
});

var badgeAJVSchema = {
  properties: {
    name: {
      type: 'string'
    }
  },
  required: ['name']
};

exports.getAllBadgeWithDepth = function (req, callback) {
  var pageNo = +req.query.pageno;
  var pageLength = +req.query.pagelength;
  var depth = '';

  if (!!req.query.depth) {
    depth = [
      {path: 'federatedBy', select: '-_id -__v -updatedAt -createdAt'}
    ];
  }

  badgeModel.find({}).select('-_id -__v -updatedAt -createdAt')
    .populate({path: 'issuer', select: '-_id -__v -updatedAt -createdAt'})
    .skip((!!pageLength && !!pageNo ? pageNo * pageLength : 0))
    .limit((!!pageLength ? pageLength : 0))
    .populate(depth)
    .lean()
    .then(function (badges) {
      if (!req.query.depth) {
        badges = badges.map(function (item) {
          return item['@id'];
        });
        return Promise.resolve(badges);
      } else if (req.query.depth == 'badge') {
        return common.customCollectionFilter(badges, ['issuer']);
      } else if (req.query.depth == 'badge.issuer') {
        return Promise.resolve(badges);
      }
    })
    .then(function (badges) {
      return callback(null, badges);
    })
    .catch(function (err) {
      return callback({error: err, code: 404}, null);
    });
};

exports.addBadge = function (req, callback) {
  var valid = ajv.validate(badgeAJVSchema, req.body);
  if (valid) {
    var oBadge = new badgeModel(req.body);
    oBadge.save(function (err, obj) {
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

exports.findBadge = function (req, callback) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return callback({
      error: ['Invalid Badge Id'],
      code: 400
    }, null);
  }

  badgeModel.findById(req.params.id).select('-_id -__v -updatedAt -createdAt')
    .populate({path: 'issuer', select: '-_id -__v -updatedAt -createdAt'})
    .lean()
    .exec(function (err, badge) {
      if (err) throw (err);

      if (!badge) {
        return callback({
          error: ['Badge doesn\'t exist'],
          code: 404
        }, null);
      }
      if (req.query.depth == null) {
        badge.metadata = !!badge.metadata ? badge.metadata['@id'] : '';
        badge = common.customObjectFilter(badge, ['issuer']);
      } else if (req.query.depth == 'issuer') {

      } else {
        return callback({
          error: ['unknown value for depth parameter'],
          code: 400
        }, null);
      }

      if (req.query.filter == null)
        callback(null, badge);
      else {
        // Apply jsPath filter here.
        var filterData = JSPath.apply(req.query.filter, badge);
        callback(null, filterData);
      }
    });
};

exports.deleteBadge = function (req, callback) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    callback({
      error: ['Invalid Badge Id'],
      code: 400
    }, null);

  badgeModel.findById(req.params.id)
    .then(function (oBadge) {
      if (!oBadge) {
        return callback({
          error: ['Badge doesn\'t exist'],
          code: 404
        }, null);
      }

      return badgeModel.findOneAndRemove({_id: req.params.id});
    })
    .then(function (oBadge) {
      return callback(null, oBadge);
    })
    .catch(function (err) {
      return callback(err, null);
    });
};

exports.updateBadge = function (req, callback) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    callback({
      error: ['Invalid Badge Id'],
      code: 400
    }, null);

  var valid = ajv.validate(badgeAJVSchema, req.body);
  if (valid) {
    badgeModel.findById(req.params.id)
      .then(function (doc) {
        if (!doc) {
          return callback({
            error: ['Badge doesn\'t exist'],
            code: 404
          }, null);
        }
        return badgeModel.findOneAndUpdate({_id: req.params.id}, req.body);
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

exports.issueBadge = function (req, callback) {
  if (!mongoose.Types.ObjectId.isValid(req.params.bid)) {
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

  var badge = null;
  badgeModel.findById(req.params.bid)
    .then(function (oBadge) {
      if (!oBadge) {
        return Promise.reject({error: 'Badge doesn\'t exist', code: 404});
      }

      if (oBadge.issuer.indexOf(req.params.pid) > -1) {
        return Promise.reject({
          error: ['Federation already exist'],
          code: 400
        });
      }
      badge = oBadge;
      return participantModel.findById(req.params.pid);
    })
    .then(function (docs) {
      if (!docs) {
        return Promise.reject({
          error: ['Participant doesn\'t exist'],
          code: 404
        });
      }
      badge.issuer.push(req.params.pid);
      return badge.save();
    })
    .then(function (oBadge) {
      return callback(null, oBadge);
    })
    .catch(function (err) {
      return callback({error: err, code: 404}, null);
    });
};