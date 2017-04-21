var mongoose = require('mongoose');
var Ajv = require('ajv');
var JSPath = require('jspath');

var requirementModel = require('../models/requirementmodel');
var common = require('../helpers/common');

var ajv = Ajv({
  allErrors: true
});

var requirementAJVSchema = {
  properties: {
    requirementFormat: {
      type: 'string'
    }
  },
  //required: ['']
};

exports.getAllRequirementWithDepth = function (req, callback) {
  var pageNo = +req.query.pageno;
  var pageLength = +req.query.pagelength;

  requirementModel.find({}).select('-_id -__v -updatedAt -createdAt')
    .skip((!!pageLength && !!pageNo ? pageNo * pageLength : 0))
    .limit((!!pageLength ? pageLength : 0))
    .lean()
    .then(function (requirement) {
      if (!req.query.depth) {
        requirement = requirement.map(function (item) {
          return item['@id'];
        });
        return callback(null, requirement);
      } else if (req.query.depth == 'requirement') {
        return callback(null, requirement);
      }
    })
    .catch(function (err) {
      return callback({error: err, code: 404}, null);
    });
};

exports.addRequirement = function (req, callback) {
  req.body.expiration = new Date(req.body.expiration);
  var valid = ajv.validate(requirementAJVSchema, req.body);
  if (valid) {
    var oRequirement = new requirementModel(req.body);
    oRequirement.save(function (err, obj) {
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

exports.findRequirement = function (req, callback) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return callback({
      error: ['Invalid Requirement Id'],
      code: 400
    }, null);
  }

  var query = requirementModel.findOne({
    _id: req.params.id
  })
    .select('-_id -__v -updatedAt -createdAt')
    .lean();

  query.exec(function (err, docs) {
    if (docs != null) {
      if (err) throw (err);

      if (req.query.filter == null) {
        callback(null, docs);
      } else {
        // Apply jsPath filter here.
        var filterdata = JSPath.apply(req.query.filter, docs);
        callback(null, filterdata);
      }
    } else {
      callback({
        error: ['Requirement not found'],
        code: 404
      }, null);
    }
  });
};

exports.deleteRequirement = function (req, callback) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    callback({
      error: ['Invalid Requirement Id'],
      code: 400
    }, null);

  requirementModel.findById(req.params.id)
    .then(function (oRequirement) {
      if (!oRequirement) {
        return callback({
          error: ['Requirement doesn\'t exist'],
          code: 404
        }, null);
      }

      return requirementModel.findOneAndRemove({_id: req.params.id});
    })
    .then(function (oRequirement) {
      return callback(null, oRequirement);
    })
    .catch(function (err) {
      return callback(err, null);
    });
};

exports.updateRequirement = function (req, callback) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    callback({
      error: ['Invalid Requirement Id'],
      code: 400
    }, null);

  var valid = ajv.validate(requirementAJVSchema, req.body);
  if (valid) {
    requirementModel.findById(req.params.id)
      .then(function (doc) {
        if (!doc) {
          return callback({
            error: ['Requirement doesn\'t exist'],
            code: 404
          }, null);
        }
        return requirementModel.findOneAndUpdate({_id: req.params.id}, req.body);
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
