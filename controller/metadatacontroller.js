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
    category: {
      type: 'string'
    }
  },
  required: ['category']
};

exports.getAllMetadataWithDepth = function (req, callback) {
  var pageNo = (+req.query.pageno);
  pageNo = pageNo > 0 ? pageNo -= 1 : pageNo;

  var pageLength = +req.query.pagelength;
  var depth = '';

  var totalResults = 0;
  metadataModel
    .find({})
    .lean()
    .then(function (metadata) {
      totalResults = metadata.length;
      if (totalResults / pageLength < pageNo) {
        return Promise.reject({error: ['Invalid page no'], code: 400});
      }

      return metadataModel.find({}).select('-_id -__v -updatedAt -createdAt')
        .skip((!!pageLength && !!pageNo ? pageNo * pageLength : 0))
        .limit((!!pageLength ? pageLength : 0))
        .lean();
    })
    .then(function (metadata) {
      if (metadata.length <= 0) {
        return Promise.reject({error: ['No records found'], code: 404});
      }

      if (!req.query.depth) {
        metadata = metadata.map(function (item) {
          return item['@id'];
        });
        return callback(null, {
          metadata: metadata,
          totalResults: totalResults,
          itemsPerPage: (!!pageLength ? pageLength : 0),
          startIndex: (!!pageNo ? pageNo + 1 : 1)
        });
      } else if (req.query.depth == 'metadata') {
        return callback(null, {
          metadata: metadata,
          totalResults: totalResults,
          itemsPerPage: (!!pageLength ? pageLength : 0),
          startIndex: (!!pageNo ? pageNo + 1 : 1)
        });
      } else {
        return callback({error: ['Invalid depth parameter'], code: 400}, null);
      }
    })
    .catch(function (err) {
      return callback(err, null);
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

  metadataModel
    .findOne({
      _id: req.params.id
    })
    .select('-_id -__v -updatedAt -createdAt')
    .lean()
    .exec()
    .then(function (metadata) {
      if (req.query.depth == null) {
        return Promise.resolve(metadata);
      } else {
        return common.depth(metadata, req.query.depth)
          .then(function (depthMeta) {
            return Promise.resolve(depthMeta);
          });
      }
    })
    .then(function (metadata) {
      if (req.query.filter == null)
        callback(null, metadata);
      else {
        try {
          var data = common.jsPathFilter(req.query.filter, metadata);
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

exports.deleteMetadata = function (req, callback) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return callback({
      error: ['Invalid Metadata Id'],
      code: 400
    }, null);
  }

  metadataModel.findById(req.params.id)
    .then(function (oMetadata) {
      if (!oMetadata) {
        return Promise.reject({
          error: ['Metadata doesn\'t exist'],
          code: 404
        });
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
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return callback({
      error: ['Invalid Metadata Id'],
      code: 400
    }, null);
  }

  var valid = true; //ajv.validate(metadataAJVSchema, req.body);
  if (valid) {
    metadataModel.findById(req.params.id)
      .then(function (doc) {
        if (!doc) {
          return Promise.reject({
            error: ['Metadata doesn\'t exist'],
            code: 404
          });
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

exports.patchMetadata = function (req, callback) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return callback({
      error: ['Invalid Metadata Id'],
      code: 400
    }, null);
  }

  if (!req.body.op) {
    return callback({
      error: ['op property must required'],
      code: 400
    }, null);
  }

  return metadataModel.findById(req.params.id)
    .then(function (metadata) {
      if (!metadata) {
        return Promise.reject({
          error: ['Metadata doesn\'t exist'],
          code: 404
        });
      }

      if (req.body.op == 'add') {
        return common.patchAdd(req.body, metadata);
      } else if (req.body.op == 'replace') {
        return common.patchReplace(req.body, metadata);
      } else if (req.body.op == 'remove') {
        return common.patchRemove(req.body, metadata);
      }
    })
    .then(function (oMetadata) {
      return callback(null, oMetadata);
    })
    .catch((function (err) {
      return callback(err, null);
    }));
};