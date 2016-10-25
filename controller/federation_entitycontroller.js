var federationModel = require("../models/federation_entitymodel");
var mongoose = require('mongoose');
var federationEntity = mongoose.model('Federation_Entity');
var common = require('../helpers/common');
var Ajv = require('ajv');
var ajv = Ajv({
    allErrors: true
});
var settings = require("../settings");
var baseURL = settings.baseURL;
var federationEntityURL = settings.federation_entity;
var JSPath = require('jspath');
var possibleDepthArr = ['federation_entity','federation_entity.organization'];

var federationEntityAJVSchema = {
    "properties": {
        "id": {
            "type": "string"
        },
        "name": {
            "type": "string"
        },
    },
    "required": ["id", "name"]
}

exports.getAllFederationEntity = function(req, callback) {

    if (req.query.depth == null) {
        federationEntity.find({}, "_id", function(err, docs) {
            var federationEntityArr = Array();
            docs.forEach(function(element) {
                federationEntityArr.push(baseURL + federationEntityURL + "/" + element._id);
            });
            callback(null, federationEntityArr);
        });
    } else if (req.query.depth == "federation_entity") {
        federationEntity.find({}).select('-__v -_id').lean().exec(function(err, docs) {
            if (err) throw err;
            for (var i = 0; i < docs.length; i++) {
                if (docs[i].organizationId != null || docs[i].organizationId != undefined)
                    docs[i]["organization"] = settings.baseURL + settings.organization + "/" + docs[i].organizationId;
                delete docs[i].organizationId;
            }
            callback(null, docs);
        });
    } else if (req.query.depth == "federation_entity.organization") {
        federationEntity.find({}).select('-__v -_id').populate({
            path: 'organizationId',
            select: '-_id -__v -federations -entities'
        }).lean().exec(function(err, docs) {
            //var finalFedArr = [];    
            for (var i = 0; i < docs.length; i++) {
                if (docs[i]["organizationId"] != null || docs[i]["organizationId"] != undefined)
                    docs[i]["organization"] =  docs[i]["organizationId"];
                delete docs[i].organizationId;
            }
            callback(null, docs);
        });
    } else {
        callback({
            "error": ['unknown value for depth parameter'],
            "code": 400
        }, null);
    }
};


exports.getAllFederationEntityWithDepth = function(req, callback) {

    var pageno = +req.query.pageno;
    var pageLength = +req.query.pagelength;

    if (req.query.depth == null) {
        if(pageno == undefined)
        {
            federationEntity.find({}, "_id", function(err, docs) {
                if(err)
                    callback(err,null);
                var federationEntityArr = Array();
                docs.forEach(function(element) {
                    federationEntityArr.push(baseURL + federationEntityURL + "/" + element._id);
                });
                callback(null, federationEntityArr);
            });
        }
        else{

             federationEntity.find({}).select("_id").skip(pageno*pageLength).limit(pageLength).exec(function(err, docs) {
                if(err)
                    callback(err,null);
                var federationEntityArr = Array();
                docs.forEach(function(element) {
                    federationEntityArr.push(baseURL + federationEntityURL + "/" + element._id);
                });
                callback(null, federationEntityArr);
            });

        }
    } else {
        var depthArr =Array();
        depthArr = depthArr.concat(req.query.depth);

        for(var i=0;i<depthArr.length;i++)
        {
            if(!(possibleDepthArr.indexOf(depthArr[i]) >-1))
            {
                callback({ "error" :["Invalid value ("+depthArr[i]+") for depth param"],"code" : 400},null);
            }
        }
        if(pageno==undefined)
        {
            federationEntity.find({}).select('-__v -_id').populate({
                path: 'organizationId',
                select: '-_id -__v -federations -entities'
            }).lean().exec(function(err, docs) {
                //var finalFedArr = [];    

                for (var i = 0; i < docs.length; i++) {
                    if (docs[i]["organizationId"] != null || docs[i]["organizationId"] != undefined)
                        docs[i]["organization"] =  docs[i]["organizationId"];
                    delete docs[i].organizationId;
                }
                if(!(possibleDepthArr.indexOf('federation_entity.organization') >-1))
                {
                    docs[i]["organization"] =  docs[i]["organization"];
                }
    
                callback(null, docs);
            });
        }
        else{

            federationEntity.find({}).select('-__v -_id').skip(pageno*pageLength).limit(pageLength).populate({
                path: 'organizationId',
                select: '-_id -__v -federations -entities'
            }).lean().exec(function(err, docs) {
                //var finalFedArr = [];    

                for (var i = 0; i < docs.length; i++) {
                    if (docs[i]["organizationId"] != null || docs[i]["organizationId"] != undefined)
                        docs[i]["organization"] =  docs[i]["organizationId"];
                    delete docs[i].organizationId;
                }
                if(!(possibleDepthArr.indexOf('federation_entity.organization') >-1))
                {
                    docs[i]["organization"] =  docs[i]["organization"];
                }
    
                callback(null, docs);
            });

        }

    }
};



exports.addFederationEntity = function(req, callback) {

    var valid = ajv.validate(federationEntityAJVSchema, req.body);
    if (valid) {
        var objFederationEntity = new federationEntity(req.body);
        objFederationEntity.save(function(err, obj) {
            if (err) throw (err);
            callback(null, obj._id);
        });
    } else {
        var errorMsg = Array();
        ajv.errors.forEach(function(element) {
            errorMsg.push(element.message);
        });
        callback({
            "error": errorMsg,
            "code": 400
        }, null);
    }
};

exports.findFederationEntity = function(req, callback) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
        callback({
            "error": ["Invalid Federation Entity Id"],
            "code": 400
        }, null);
    if (req.query.depth == null) {
        var query = federationEntity.findOne({
            _id: req.params.id
        }).select('-_id -__v').lean();
        query.exec(function(err, docs) {
            if (docs != null) {
                if (err) throw (err);
                if (docs["organizationId"] != null || docs["organizationId"] != undefined)
                    docs["organization"] = settings.baseURL + settings.organization + "/"+ docs["organizationId"];
                delete docs.organizationId;

                if (req.query.filter == null)
                    callback(null, docs);

                else {
                    // Apply jsPath filter here.
                    var filterdata = JSPath.apply(req.query.filter, docs);
                    callback(null, filterdata);
                }

            } else {

                callback({
                    "error": ["Federation Entity not found"],
                    "code": 404
                }, null);
            }
        });
    } else if (req.query.depth = "organization") {
        federationEntity.findOne({
            _id: req.params.id
        }).select('-__v -_id').populate({
            path: 'organizationId',
            select: '-_id -__v -federations -entities'
        }).lean().exec(function(err, docs) {
            //var finalFedArr = [];    

            if (docs != null) {
                if (docs["organizationId"] != null || docs["organizationId"] != undefined)
                    docs["organization"] = settings.baseURL + settings.organization + "/"+ docs["organizationId"];
                delete docs.organizationId;

                if (req.query.filter == null)
                    callback(null, docs);

                else {
                    // Apply jsPath filter here.
                    var filterdata = JSPath.apply(req.query.filter, docs);
                    callback(null, filterdata);
                }
            } else {
                callback({
                    "error": ["Federation Entity not found"],
                    "code": 404
                }, null);
            }
        });
    }
};

exports.deleteFederationEntity = function(req, callback) {

    if (!mongoose.Types.ObjectId.isValid(req.params.id))
        callback({
            "error": ["Invalid Federation Entity Id"],
            "code": 400
        }, null);

    federationEntity.find({
        _id: req.params.id
    }, "_id", function(err, docs) {
        console.log(docs);
        if (err) callback(err, null);
        if (docs.length == 0) {
            callback({
                "error": ["Federation Entity doesn't exist"],
                "code": 404
            }, null);
        }
        federationEntity.findOneAndRemove({
            _id: req.params.id
        }, function(err) {
            if (err) callback(err, null);
            callback(null);
        });
    });
};


exports.updateFederationEntity = function(req, callback) {

    if (!mongoose.Types.ObjectId.isValid(req.params.id))
        callback({
            "error": ["Invalid Federation Entity Id"],
            "code": 400
        }, null);

    var valid = ajv.validate(federationEntityAJVSchema, req.body);
    if (valid) {
        federationEntity.findOne({
            _id: req.params.id
        }, "_id", function(err, docs) {
            //console.log(docs);
            if (docs != null) {
                federationEntity.findOneAndUpdate({
                    _id: req.params.id
                }, req.body, function(err, data) {
                    if (err) throw (err);
                    //console.log(obj._id);
                    callback(null, data);
                });
            } else {
                callback({
                    "error": ["Federation Entity not found"],
                    "code": 404
                }, null);
            }
        });
    } else {
        var errorMsg = Array();
        ajv.errors.forEach(function(element) {
            errorMsg.push(element.message);
        });
        callback({
            "error": errorMsg,
            "code": 400
        }, null);
    }

};