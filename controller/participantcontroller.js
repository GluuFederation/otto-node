var JSPath = require('jspath');
var mongoose = require('mongoose');
var Transaction = require('mongoose-transaction')(mongoose);
var Ajv = require('ajv');

var settings = require('../settings');
var participantModel = require('../models/participantmodel');

var baseURL = settings.baseURL;
var participantURL = settings.participant;
var possibleDepthArr = ['participant.federations', 'participant', 'participant.entities'];
var ajv = Ajv({
  allErrors: true
});
var participantAJVSchema = {
  properties: {
    name: {
      type: "string"
    }
  },
  required: ['name']
};

exports.getAllParticipant = function (req, callback) {
  if (req.query.depth == null) {
    participantModel.find({}, "_id", function (err, docs) {
      var participantArr = Array();
      docs.forEach(function (element) {
        participantArr.push(baseURL + participantURL + "/" + element._id);
      });
      callback(null, participantArr);
    });
  } else if (req.query.depth == 'participant') {

    participantModel.find({}).select('-__v -_id').lean().exec(function (err, docs) {

      docs.forEach(function (element) {

        for (var i = 0; i < docs.length; i++) {

          for (var j = 0; j < docs[i].entities.length; j++) {
            docs[i].entities[j] = settings.baseURL + settings.federation_entity + "/" + docs[i].entities[j];
          }
          for (var j = 0; j < docs[i].federations.length; j++) {
            docs[i].federations[j] = settings.baseURL + settings.federations + "/" + docs[i].federations[j];
          }
        }
        callback(null, docs);
      }, this);
    });

  } else if (req.query.depth == 'participant.federations') {
    participantModel.find({}).select('-__v -_id').populate({
      path: 'federations',
      select: '-_id -__v -participantId -entities'
    }).lean().exec(function (err, docs) {
      for (var i = 0; i < docs.length; i++) {
        for (var j = 0; j < docs[i].entities.length; j++) {
          docs[i].entities[j] = settings.baseURL + settings.federation_entity + "/" + docs[i].entities[j];
        }
      }
      callback(null, docs);
    });

  } else if (req.query.depth == 'participant.entities') {

    participantModel.find({}).select('-__v -_id').populate({
      path: 'entities',
      select: '-_id -__v -participantId -entities'
    }).lean().exec(function (err, docs) {

      for (var i = 0; i < docs.length; i++) {
        for (var j = 0; j < docs[i].federations.length; j++) {
          docs[i].federations[j] = settings.baseURL + settings.federations + "/" + docs[i].federations[j];
        }
      }

      callback(null, docs);
    });
  } else {

    callback({
      error: ['unknown value for depth parameter'],
      code: 400
    }, null);
  }

};

exports.getAllParticipantWithDepth = function (req, callback) {

  var pageno = +req.query.pageno;
  var pageLength = +req.query.pagelength;

  if (req.query.depth == null) {
    if (pageno == undefined) {
      participantModel.find({}, function (err, docs) {
        var participantArr = Array();
        docs.forEach(function (element) {
          participantArr.push(element['@id']);
        });
        callback(null, participantArr);
      });
    }
    else {
      participantModel.find({}).select("_id").skip(pageno * pageLength).limit(pageLength).exec(function (err, docs) {
        var participantArr = Array();
        docs.forEach(function (element) {
          participantArr.push(baseURL + participantURL + "/" + element._id);
        });
        callback(null, participantArr);
      });
    }
  }
  else {

    for (var i = 0; i < depthArr.length; i++) {
      if (!(possibleDepthArr.indexOf(depthArr[i]) > -1)) {
        callback({error: ['unknown value for depth parameter'], code: 400}, null);
      }
    }
    if (pageno == undefined) {
      participantModel.find({}).select('-__v -_id').populate({
        path: 'federations',
        select: '-_id -__v -participantId -entities'
      }).populate({
        path: 'entities',
        select: '-_id -__v -participantId'
      }).lean().exec(function (err, docs) {

        for (var i = 0; i < docs.length; i++) {

          for (var j = 0; j < docs[i].entities.length; j++) {
            docs[i].entities[j] = settings.baseURL + settings.federation_entity + "/" + docs[i].entities[j];
          }

        }
        callback(null, docs);
      });
    }
    else {

      participantModel.find({}).select('-__v -_id').populate({
        path: 'federations',
        select: '-_id -__v -participantId -entities'
      }).populate({
        path: 'entities',
        select: '-_id -__v -participantId'
      }).skip(pageno * pageLength).limit(pageLength).lean().exec(function (err, docs) {

        for (var i = 0; i < docs.length; i++) {

          for (var j = 0; j < docs[i].entities.length; j++) {
            docs[i].entities[j] = settings.baseURL + settings.entity + "/" + docs[i].entities[j];
          }
        }
        callback(null, docs);
      });
    }
  }
};

exports.addParticipant = function (req, callback) {
  var valid = ajv.validate(participantAJVSchema, req.body);
  if (valid) {
    var oParticipant = new participantModel(req.body);
    oParticipant.save(function (err, obj) {
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

exports.findParticipant = function (req, callback) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return callback({
      error: ['Invalid Participant Id'],
      code: 400
    }, null);

  if (req.query.depth == null) {
    participantModel.findById(req.params.id)
      .select('-_id -__v')
      .populate({path: 'registeredBy', select: {'@id': 1, name: 1, _id: 0}})
      .populate({path: 'memberOf', select: '-_id -__v'})
      .populate({path: 'operates', select: '-_id -__v'})
      .exec(function (err, docs) {
        if (err) throw (err);
        var data = JSON.parse(JSON.stringify(docs._doc));
        data.memberOf = data.memberOf.map(function (item, index) {
          return item['@id'];
        });
        data.operates = data.operates['@id'];

        if (req.query.filter == null)
          callback(null, data);
        else {
          // Apply jsPath filter here.
          var filterdata = JSPath.apply(req.query.filter, data);
          callback(null, filterdata);
        }
      });
  }
  else if (req.query.depth == 'federations') {
    participantModel.findOne({_id: req.params.id}).select('-__v -_id').populate({
      path: 'federations',
      select: '-_id -__v -participantId -entities'
    }).lean().exec(function (err, docs) {


      for (var j = 0; j < docs.entities.length; j++) {
        docs.entities[j] = settings.baseURL + settings.federation_entity + "/" + docs.entities[j];
      }
      if (req.query.filter == null)
        callback(null, docs);

      else {
        // Apply jsPath filter here.
        var filterdata = JSPath.apply(req.query.filter, docs);
        callback(null, filterdata);
      }

    });

  } else if (req.query.depth == 'entities') {

    participantModel.findOne({_id: req.params.id}).select('-__v -_id').populate({
      path: 'entities',
      select: '-_id -__v -participantId -entities'
    }).lean().exec(function (err, docs) {


      for (var j = 0; j < docs.federations.length; j++) {
        docs.federations[j] = settings.baseURL + settings.federations + "/" + docs.federations[j];
      }


      if (req.query.filter == null)
        callback(null, docs);

      else {
        // Apply jsPath filter here.
        var filterdata = JSPath.apply(req.query.filter, docs);
        callback(null, filterdata);
      }


    });
  }
  else {
    callback({
      error: ['unknown value for depth parameter'],
      code: 400
    }, null);
  }
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