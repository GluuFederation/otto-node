var mongoose = require('mongoose');
var Ajv = require('ajv');
var JSPath = require('jspath');

var metadataModel = require('../models/metadatamodel');
var common = require('../helpers/common');

var ajv = Ajv({
  allErrors: true
});

var metadataAJVSchema = {
  properties: {
    metadataFormat: {
      type: 'string'
    }
  },
  required: ['metadataFormat']
};

exports.getAllMetadataWithDepth = function (req, callback) {
  var pageNo = +req.query.pageno;
  var pageLength = +req.query.pagelength;

  metadataModel.find({}).select('-_id -__v -updatedAt -createdAt')
    .skip((!!pageLength && !!pageNo ? pageNo * pageLength : 0))
    .limit((!!pageLength ? pageLength : 0))
    .lean()
    .then(function (metadata) {
      if (!req.query.depth) {
        metadata = metadata.map(function (item) {
          return item['@id'];
        });
        return callback(null, metadata);
      } else if (req.query.depth == 'metadata') {
        return callback(null, metadata);
      }
    })
    .catch(function (err) {
      return callback({error: err, code: 404}, null);
    });
};

exports.addMetadata = function (req, callback) {
  req.body.expiration = new Date(req.body.expiration);
  var valid = ajv.validate(metadataAJVSchema, req.body);
  if (valid) {
    var oMetadata = new metadataModel(req.body);
    oMetadata.save(function (err, obj) {
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

exports.findMetadata = function (req, callback) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return callback({
      error: ['Invalid Metadata Id'],
      code: 400
    }, null);
  }

  var query = metadataModel.findOne({
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
        error: ['Metadata not found'],
        code: 404
      }, null);
    }
  });
};

exports.deleteMetadata = function (req, callback) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    callback({
      error: ['Invalid Metadata Id'],
      code: 400
    }, null);

  metadataModel.findById(req.params.id)
    .then(function (oMetadata) {
      if (!oMetadata) {
        return callback({
          error: ['Metadata doesn\'t exist'],
          code: 404
        }, null);
      }

      return metadataModel.findOneAndRemove({_id: req.params.id});
    })
    .then(function (oMetadata) {
      return callback(null, oMetadata);
    })
    .catch(function (err) {
      return callback(err, null);
    });
};

exports.updateMetadata = function (req, callback) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    callback({
      error: ['Invalid Metadata Id'],
      code: 400
    }, null);

  var valid = ajv.validate(metadataAJVSchema, req.body);
  if (valid) {
    metadataModel.findById(req.params.id)
      .then(function (doc) {
        if (!doc) {
          return callback({
            error: ['Metadata doesn\'t exist'],
            code: 404
          }, null);
        }
        return metadataModel.findOneAndUpdate({_id: req.params.id}, req.body);
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
