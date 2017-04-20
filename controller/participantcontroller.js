var JSPath = require('jspath');
var mongoose = require('mongoose');
var Transaction = require('mongoose-transaction')(mongoose);
var Ajv = require('ajv');

var settings = require('../settings');
var participantModel = require('../models/participantmodel');
var common = require('../helpers/common');

var baseURL = settings.baseURL;
var participantURL = settings.participant;
var ajv = Ajv({
  allErrors: true
});
var participantAJVSchema = {
  properties: {
    name: {
      type: 'string'
    }
  },
  required: ['name']
};

exports.getAllParticipantWithDepth = function (req, callback) {
  var pageNo = +req.query.pageno;
  var pageLength = +req.query.pagelength;
  var depth = '';

  if (!!req.query.depth) {
    depth = [
      {path: 'memberOf', select: '-_id -__v -updatedAt -createdAt'},
      {path: 'operates', select: '-_id -__v -updatedAt -createdAt'}
    ];
  }

  participantModel.find({}).select('-_id -__v -updatedAt -createdAt')
    .skip((!!pageLength && !!pageNo ? pageNo * pageLength : 0))
    .limit((!!pageLength ? pageLength : 0))
    .populate(depth)
    .lean()
    .then(function (participants) {
      if (!req.query.depth) {
        participants = participants.map(function (item) {
          return item['@id'];
        });
        return Promise.resolve(participants);
      } else if (req.query.depth == 'participants') {
        participants.forEach(function (item) {
          item.operates = !!item.operates ? item.operates['@id'] : '';
        });

        return common.customCollectionFilter(participants, ['memberOf']);
      } else if (req.query.depth == 'participants.memberOf') {
        participants.forEach(function (item) {
          item.operates = !!item.operates ? item.operates['@id'] : '';
        });

        return Promise.resolve(participants);
      } else if (req.query.depth == 'participants.operates') {
        return common.customCollectionFilter(participants, ['memberOf']);
      }

    })
    .then(function (federations) {
      return callback(null, federations);
    })
    .catch(function (err) {
      return callback({error: err, code: 404}, null);
    });
};

exports.addParticipant = function (req, callback) {
  var valid = ajv.validate(participantAJVSchema, req.body);
  if (valid) {
    var oParticipant = new participantModel(req.body);
    oParticipant.save(function (err, obj) {
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

exports.findParticipant = function (req, callback) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return callback({
      error: ['Invalid Participant Id'],
      code: 400
    }, null);
  }

  participantModel.findById(req.params.id).select('-_id -__v -updatedAt -createdAt')
    .populate({path: 'memberOf', select: '-_id -__v'})
    .populate({path: 'operates', select: '-_id -__v'})
    .populate({path: 'registeredBy', select: {'@id': 1, name: 1, _id: 0}})
    .lean()
    .exec(function (err, participant) {
      if (err) throw (err);

      if (!participant) {
        return callback({
          error: ['Federation doesn\'t exist'],
          code: 404
        }, null);
      }
      participant.registeredBy = participant.registeredBy['@id'];
      if (req.query.depth == null) {
        participant.operates = participant.operates['@id'];
        participant = common.customObjectFilter(participant, ['memberOf']);
      } else if (req.query.depth == 'operates') {
        participant = common.customObjectFilter(participant, ['memberOf']);
      } else if (req.query.depth == 'memberOf') {
        participant.operates = participant.operates['@id'];
      } else if (req.query.depth == 'memberOf,operates') {
      } else {
        return callback({
          error: ['unknown value for depth parameter'],
          code: 400
        }, null);
      }

      if (req.query.filter == null)
        callback(null, participant);
      else {
        // Apply jsPath filter here.
        var filterData = JSPath.apply(req.query.filter, federation);
        callback(null, filterData);
      }
    });

};

exports.deleteParticipant = function (req, callback) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return callback({
      error: ['Invalid Participant Id'],
      code: 400
    }, null);
  }

  participantModel.findById(req.params.id)
    .then(function (oParticipant) {
      if (!oParticipant) {
        return Promise.reject({
          error: ['Participant doesn\'t exist'],
          code: 404
        });
      }

      return participantModel.findOneAndRemove({_id: req.params.id});
    })
    .then(function (oParticipant) {
      return callback(null, oParticipant);
    })
    .catch(function (err) {
      return callback({error: err, code: 404}, null);
    });
};

exports.updateParticipant = function (req, callback) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return callback({
      error: ['Invalid Participant Id'],
      code: 400
    }, null);
  }

  var valid = ajv.validate(participantAJVSchema, req.body);
  if (valid) {
    participantModel.findById(req.params.id)
      .then(function (doc) {
        if (!doc) {
          return Promise.reject({
            error: ['Participant doesn\'t exist'],
            code: 404
          });
        }
        return participantModel.findOneAndUpdate({_id: req.params.id}, req.body);
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

exports.joinFederationParticipant = function (req, callback) {
  if (!mongoose.Types.ObjectId.isValid(req.params.pid)) {
    return callback({
      error: ['Invalid Participant Id'],
      code: 400
    }, null);
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.fid)) {
    return callback({
      error: ['Invalid Federation Id'],
      code: 400
    }, null);
  }

  participantModel.findById(req.params.pid)
    .then(function (oParticipant) {
      if (!oParticipant) {
        return Promise.reject({
          error: ['Participant doesn\'t exists'],
          code: 404
        });
      }

      if (oParticipant.memberOf.indexOf(req.params.fid) > -1)
        return Promise.reject(callback({
          error: ['Federation already exist'],
          code: 404
        }, null));

      oParticipant.memberOf.push(req.params.fid);
      return oParticipant.save();
    })
    .then(function (oParticipant) {
      return callback(null, oParticipant);
    })
    .catch(function (err) {
      return callback({error: err, code: 404}, null);
    });
};

exports.joinEntityParticipant = function (req, callback) {
  if (!mongoose.Types.ObjectId.isValid(req.params.pid)) {
    return callback({
      error: ['Invalid Participant Id'],
      code: 400
    }, null);
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.eid)) {
    return callback({
      error: ['Invalid Federation Entity Id'],
      code: 400
    }, null);
  }

  participantModel.findById(req.params.pid)
    .then(function (oParticipant) {
      if (!oParticipant) {
        return Promise.reject({
          error: ['Participant doesn\'t exists'],
          code: 404
        });
      }
      oParticipant.operates = req.params.eid;
      return oParticipant.save();
    })
    .then(function (oParticipant) {
      return callback(null, oParticipant);
    })
    .catch(function (err) {
      return callback({error: err, code: 404}, null);
    });
};