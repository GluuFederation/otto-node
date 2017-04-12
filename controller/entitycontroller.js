var mongoose = require('mongoose');
var Ajv = require('ajv');
var JSPath = require('jspath');

var entity = require('../models/entitymodel');
var settings = require('../settings');
var common = require('../helpers/common');

var ajv = Ajv({
  allErrors: true
});

var baseURL = settings.baseURL;
var entityURL = settings.entity;
var possibleDepthArr = ['federation_entity', 'federation_entity.organization'];

var entityAJVSchema = {
  properties: {
    name: {
      type: "string"
    }
  },
  required: ['name']
};

exports.getAllEntity = function (req, callback) {
  if (req.query.depth == null) {
    entity.find({}, function (err, docs) {
      var entityArr = Array();
      docs.forEach(function (element) {
        entityArr.push(baseURL + entityURL + '/' + element._id);
      });
      callback(null, entityArr);
    });
  } else if (req.query.depth == "federation_entity") {
    entity.find({}).select('-__v -_id').lean().exec(function (err, docs) {
      if (err) throw err;
      for (var i = 0; i < docs.length; i++) {
        if (docs[i].organization != null || docs[i].organization != undefined)
          docs[i]['organization'] = settings.baseURL + settings.organization + "/" + docs[i].organization;
        delete docs[i].organization;
      }
      callback(null, docs);
    });
  } else if (req.query.depth == "federation_entity.organization") {
    entity.find({}).select('-__v -_id').populate({
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


exports.getAllEntityWithDepth = function (req, callback) {

  var pageno = +req.query.pageno;
  var pageLength = +req.query.pagelength;

  if (req.query.depth == null) {
    if (pageno == undefined) {
      entity.find({}, "_id", function (err, docs) {
        if (err)
          callback(err, null);
        var entityArr = Array();
        docs.forEach(function (element) {
          entityArr.push(baseURL + entityURL + "/" + element._id);
        });
        callback(null, entityArr);
      });
    }
    else {

      entity.find({}).select("_id").skip(pageno * pageLength).limit(pageLength).exec(function (err, docs) {
        if (err)
          callback(err, null);
        var entityArr = Array();
        docs.forEach(function (element) {
          entityArr.push(baseURL + entityURL + "/" + element._id);
        });
        callback(null, entityArr);
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
      entity.find({}).select('-__v -_id').populate({
        path: 'organization',
        select: '-_id -__v -federations -entities'
      }).lean().exec(function (err, docs) {
        //var finalFedArr = [];

        for (var i = 0; i < docs.length; i++) {
          if (docs[i]['organization'] != null || docs[i]['organization'] != undefined)
            docs[i]['organization'] = docs[i]['organization'];
          delete docs[i].organization;
        }
        if (!(possibleDepthArr.indexOf('federation_entity.organization') > -1)) {
          docs[i]['organization'] = docs[i]['organization'];
        }

        callback(null, docs);
      });
    }
    else {

      entity.find({}).select('-__v -_id').skip(pageno * pageLength).limit(pageLength).populate({
        path: 'organization',
        select: '-_id -__v -federations -entities'
      }).lean().exec(function (err, docs) {
        //var finalFedArr = [];

        for (var i = 0; i < docs.length; i++) {
          if (docs[i]['organization'] != null || docs[i]['organization'] != undefined)
            docs[i]['organization'] = docs[i]['organization'];
          delete docs[i].organization;
        }
        if (!(possibleDepthArr.indexOf('federation_entity.organization') > -1)) {
          docs[i]['organization'] = docs[i]['organization'];
        }

        callback(null, docs);
      });

    }

  }
};

exports.addEntity = function (req, callback) {
  var valid = ajv.validate(entityAJVSchema, req.body);
  if (valid) {
    var oEntity = new entity(req.body);
    oEntity.save(function (err, obj) {
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

exports.findEntity = function (req, callback) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    callback({
      error: ['Invalid Federation Entity Id'],
      code: 400
    }, null);
  if (req.query.depth == null) {
    var query = entity.findOne({
      _id: req.params.id
    }).lean();
    query.exec(function (err, docs) {
      if (docs != null) {
        if (err) throw (err);

        if (req.query.filter == null)
          callback(null, docs);

        else {
          // Apply jsPath filter here.
          var filterdata = JSPath.apply(req.query.filter, docs);
          callback(null, filterdata);
        }

      } else {

        callback({
          error: ['Federation Entity not found'],
          code: 404
        }, null);
      }
    });
  } else if (req.query.depth = "organization") {
    entity.findOne({
      _id: req.params.id
    }).select('-__v -_id').populate({
      path: 'organization',
      select: '-_id -__v -federations -entities'
    }).lean().exec(function (err, docs) {
      //var finalFedArr = [];

      if (docs != null) {
        if (docs['organization'] != null || docs['organization'] != undefined)
          docs['organization'] = settings.baseURL + settings.organization + "/" + docs['organization'];
        delete docs.organization;

        if (req.query.filter == null)
          callback(null, docs);

        else {
          // Apply jsPath filter here.
          var filterdata = JSPath.apply(req.query.filter, docs);
          callback(null, filterdata);
        }
      } else {
        callback({
          error: ['Federation Entity not found'],
          code: 404
        }, null);
      }
    });
  }
};

exports.deleteEntity = function (req, callback) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    callback({
      error: ['Invalid Entity Id'],
      code: 400
    }, null);

  entity.findById(req.params.id)
    .then(function (oEntity) {
      if (!oEntity) {
        return callback({
          error: ['Entity doesn\'t exist'],
          code: 404
        }, null);
      }

      return entity.findOneAndRemove({_id: req.params.id});
    })
    .then(function (oEntity) {
      return callback(null, oEntity);
    })
    .catch(function (err) {
      return callback(err, null);
    });
};

exports.updateEntity = function (req, callback) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    callback({
      error: ['Invalid Entity Id'],
      code: 400
    }, null);

  var valid = ajv.validate(entityAJVSchema, req.body);
  if (valid) {
    entity.findById(req.params.id)
      .then(function (doc) {
        if (!doc) {
          return callback({
            error: ['Entity doesn\'t exist'],
            code: 404
          }, null);
        }
        return entity.findOneAndUpdate({_id: req.params.id}, req.body);
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