var mongoose = require('mongoose');
var Ajv = require('ajv');
var JSPath = require('jspath');

var metadataModel = require('../models/metadatamodel');
var settings = require('../settings');
var common = require('../helpers/common');

var ajv = Ajv({
  allErrors: true
});

var baseURL = settings.baseURL;
var metadataURL = settings.metadata;
var possibleDepthArr = ['federation_metadata', 'federation_metadata.organization'];

var metadataAJVSchema = {
  properties: {
    metadataFormat: {
      type: 'string'
    }
  },
  required: ['metadataFormat']
};

exports.getAllMetadata = function (req, callback) {
  if (req.query.depth == null) {
    metadataModel.find({}, function (err, docs) {
      var metadataArr = Array();
      docs.forEach(function (element) {
        metadataArr.push(baseURL + metadataURL + '/' + element._id);
      });
      callback(null, metadataArr);
    });
  } else if (req.query.depth == "federation_metadata") {
    metadataModel.find({}).select('-__v -_id').lean().exec(function (err, docs) {
      if (err) throw err;
      for (var i = 0; i < docs.length; i++) {
        if (docs[i].organization != null || docs[i].organization != undefined)
          docs[i]['organization'] = settings.baseURL + settings.organization + "/" + docs[i].organization;
        delete docs[i].organization;
      }
      callback(null, docs);
    });
  } else if (req.query.depth == "federation_metadata.organization") {
    metadataModel.find({}).select('-__v -_id').populate({
      path: 'organization',
      select: '-_id -__v -federations -entities'
    }).lean().exec(function (err, docs) {
      //var finalFedArr = [];
      for (var i = 0; i < docs.length; i++) {
        if (docs[i]['organization'] != null || docs[i]['organization'] != undefined)
          docs[i]['organization'] = docs[i]['organization'];
        delete docs[i].organization;
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

exports.getAllMetadataWithDepth = function (req, callback) {

  var pageno = +req.query.pageno;
  var pageLength = +req.query.pagelength;

  if (req.query.depth == null) {
    if (pageno == undefined) {
      metadataModel.find({}, "_id", function (err, docs) {
        if (err)
          callback(err, null);
        var metadataArr = Array();
        docs.forEach(function (element) {
          metadataArr.push(baseURL + metadataURL + "/" + element._id);
        });
        callback(null, metadataArr);
      });
    }
    else {

      metadataModel.find({}).select("_id").skip(pageno * pageLength).limit(pageLength).exec(function (err, docs) {
        if (err)
          callback(err, null);
        var metadataArr = Array();
        docs.forEach(function (element) {
          metadataArr.push(baseURL + metadataURL + "/" + element._id);
        });
        callback(null, metadataArr);
      });

    }
  } else {
    var depthArr = Array();
    depthArr = depthArr.concat(req.query.depth);

    for (var i = 0; i < depthArr.length; i++) {
      if (!(possibleDepthArr.indexOf(depthArr[i]) > -1)) {
        callback({error: ['Invalid value ("+depthArr[i]+") for depth param'], code: 400}, null);
      }
    }
    if (pageno == undefined) {
      metadataModel.find({}).select('-__v -_id').populate({
        path: 'organization',
        select: '-_id -__v -federations -entities'
      }).lean().exec(function (err, docs) {
        //var finalFedArr = [];

        for (var i = 0; i < docs.length; i++) {
          if (docs[i]['organization'] != null || docs[i]['organization'] != undefined)
            docs[i]['organization'] = docs[i]['organization'];
          delete docs[i].organization;
        }
        if (!(possibleDepthArr.indexOf('federation_metadata.organization') > -1)) {
          docs[i]['organization'] = docs[i]['organization'];
        }

        callback(null, docs);
      });
    }
    else {

      metadataModel.find({}).select('-__v -_id').skip(pageno * pageLength).limit(pageLength).populate({
        path: 'organization',
        select: '-_id -__v -federations -entities'
      }).lean().exec(function (err, docs) {
        //var finalFedArr = [];

        for (var i = 0; i < docs.length; i++) {
          if (docs[i]['organization'] != null || docs[i]['organization'] != undefined)
            docs[i]['organization'] = docs[i]['organization'];
          delete docs[i].organization;
        }
        if (!(possibleDepthArr.indexOf('federation_metadata.organization') > -1)) {
          docs[i]['organization'] = docs[i]['organization'];
        }

        callback(null, docs);
      });

    }

  }
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
