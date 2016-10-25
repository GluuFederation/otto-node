var federationmodel = require("../models/organizationmodel");
var mongoose = require('mongoose');
var Transaction = require('mongoose-transaction')(mongoose);
var organization = mongoose.model('Organization');
var common = require('../helpers/common');
var Ajv = require('ajv');
var ajv = Ajv({
    allErrors: true
});
var settings = require("../settings");
var baseURL = settings.baseURL;
var organizationURL = settings.organization;
var JSPath = require('jspath');
var possibleDepthArr = ['organization.federations','organization','organization.entities'];

var organizationAJVSchema = {
    "properties": {
        "name": {
            "type": "string"
        },
    },
    "required": ["name"]
}

exports.getAllOrganization = function(req, callback) {
    if (req.query.depth == null) {
        organization.find({}, "_id", function(err, docs) {
            var organizationArr = Array();
            docs.forEach(function(element) {
                organizationArr.push(baseURL + organizationURL + "/" + element._id);
            });
            callback(null, organizationArr);
        });
    } else if (req.query.depth == 'organization') {

        organization.find({}).select('-__v -_id').lean().exec(function(err, docs) {

            docs.forEach(function(element) {

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

    } else if (req.query.depth == 'organization.federations') {
        organization.find({}).select('-__v -_id').populate({
            path: 'federations',
            select: '-_id -__v -organizationId -entities'
        }).lean().exec(function(err, docs) {
            for (var i = 0; i < docs.length; i++) {
                for (var j = 0; j < docs[i].entities.length; j++) {
                    docs[i].entities[j] = settings.baseURL + settings.federation_entity + "/" + docs[i].entities[j];
                }
         }
         callback(null, docs);
        });

    } else if (req.query.depth == 'organization.entities') {

        organization.find({}).select('-__v -_id').populate({
            path: 'entities',
            select: '-_id -__v -organizationId -entities'
        }).lean().exec(function(err, docs) {
            
            for (var i = 0; i < docs.length; i++) {
                for (var j = 0; j < docs[i].federations.length; j++) {
                    docs[i].federations[j] = settings.baseURL + settings.federations + "/" + docs[i].federations[j];
                }
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

exports.getAllOrganizationWithDepth = function(req,callback){

var pageno = +req.query.pageno;
var pageLength = +req.query.pagelength;

if (req.query.depth == null) {
        if(pageno == undefined)
        {
            organization.find({}, "_id", function(err, docs) {
                var organizationArr = Array();
                docs.forEach(function(element) {
                    organizationArr.push(baseURL + organizationURL + "/" + element._id);
                });
                callback(null, organizationArr);
            });
        }
        else{
            organization.find({}).select("_id").skip(pageno*pageLength).limit(pageLength).exec(function(err, docs) {
                var organizationArr = Array();
                docs.forEach(function(element) {
                    organizationArr.push(baseURL + organizationURL + "/" + element._id);
                });
                callback(null, organizationArr);
            });
        }
    }
    else{
          
        for(var i=0;i<depthArr.length;i++)
        {
            if(!(possibleDepthArr.indexOf(depthArr[i]) >-1))
            {
                callback({"error" :['unknown value for depth parameter'],"code" : 400 },null);
            }
        }
       if(pageno == undefined){
            organization.find({}).select('-__v -_id').populate({
                path: 'federations',
                select: '-_id -__v -organizationId -entities'
            }).populate({
                path: 'entities',
                select: '-_id -__v -organizationId'
            }).lean().exec(function(err, docs) {

                for (var i = 0; i < docs.length; i++) {
                
                    for (var j = 0; j < docs[i].entities.length; j++) {
                        docs[i].entities[j] = settings.baseURL + settings.federation_entity + "/" + docs[i].entities[j];
                    }
    
            }
            callback(null, docs);
            });
       }
       else{

              organization.find({}).select('-__v -_id').populate({
                path: 'federations',
                select: '-_id -__v -organizationId -entities'
            }).populate({
                path: 'entities',
                select: '-_id -__v -organizationId'
            }).skip(pageno*pageLength).limit(pageLength).lean().exec(function(err, docs) {

                for (var i = 0; i < docs.length; i++) {
                
                    for (var j = 0; j < docs[i].entities.length; j++) {
                        docs[i].entities[j] = settings.baseURL + settings.federation_entity + "/" + docs[i].entities[j];
                    }
    
            }
            callback(null, docs);
            });
       }

       } 
      } 


exports.addOrganization = function(req, callback) {

    var valid = ajv.validate(organizationAJVSchema, req.body);
    if (valid) {
        var ObjOrganization = new organization(req.body);
        ObjOrganization.save(function(err, obj) {
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


exports.findOrganization = function(req, callback) {

    if (!mongoose.Types.ObjectId.isValid(req.params.id))
        callback({
            "error": ["Invalid Organization Id"],
            "code": 400
        }, null);
    if(req.query.depth == null){    
        var query = organization.findOne({
            _id: req.params.id
        }).select('-_id -__v'); //.populate({path:'federations',select:'@id name -_id'});
        query.exec(function(err, docs) {
            if (err) throw (err);
            var data = JSON.parse(JSON.stringify(docs._doc));
            for (var i = 0; i < data.federations.length; i++) {
                data.federations[i] = settings.baseURL + settings.federations + "/" + data.federations[i];
            }
            for (var i = 0; i < data.entities.length; i++) {
                data.entities[i] = settings.baseURL + settings.federation_entity + "/" + data.entities[i];
            }

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
        organization.findOne({ _id: req.params.id}).select('-__v -_id').populate({
            path: 'federations',
            select: '-_id -__v -organizationId -entities'
        }).lean().exec(function(err, docs) {

            

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

        organization.findOne({_id: req.params.id}).select('-__v -_id').populate({
            path: 'entities',
            select: '-_id -__v -organizationId -entities'
        }).lean().exec(function(err, docs) {
           

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
    else{
         callback({
            "error": ['unknown value for depth parameter'],
            "code": 400
        }, null);
    }
};


exports.deleteOrganization = function(req, callback) {

    if (!mongoose.Types.ObjectId.isValid(req.params.id))
        callback({
            "error": ["Invalid Organization Id"],
            "code": 400
        }, null);

    organization.find({
        _id: req.params.id
    }, "_id", function(err, docs) {

        if (err)
            throw (err);

        if (docs.length == 0)
            callback({
                "error": ["Organization doesn't exists"],
                "code": 404
            }, null);

        organization.findOneAndRemove({
            _id: req.params.id
        }, function(err) {
            if (err) throw (err);
            callback(null);
        });
    });

};


exports.updateOrganizattion = function(req, callback) {

    if (!mongoose.Types.ObjectId.isValid(req.params.id))
        callback({
            "error": ["Invalid Organization Id"],
            "code": 400
        }, null);

    var valid = ajv.validate(organizationAJVSchema, req.body);
    if (valid) {

        organization.findOneAndUpdate({
            _id: req.params.id
        }, req.body, function(err, data) {
            if (err)
                throw (err);
            callback(null, data);
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

exports.joinFederationOrganization = function(req, callback) {

    if (!mongoose.Types.ObjectId.isValid(req.params.oid))
        callback({
            "error": ["Invalid Organization Id"],
            "code": 400
        }, null);
    if (!mongoose.Types.ObjectId.isValid(req.params.fid))
        callback({
            "error": ["Invalid Federation Id"],
            "code": 400
        }, null);

    organization.findOne({
        _id: req.params.oid
    }, function(err, doc) {

        if (err)
            callback(err, null);
        if (doc == null)
            callback({
                "error": ["Organization doesn't exists"],
                "code": 404
            }, null);

        if (doc.federations.indexOf(req.params.fid) > -1)
            callback({
                "error": ["Federation already exist"],
                "code": 404
            }, null);

        doc.federations.push(req.params.fid);
        var transaction = new Transaction();
        transaction.update('Organization', req.params.oid, doc);
        transaction.update('Federation', req.params.fid, {
            organizationId: req.params.oid
        });
        transaction.run(function(err, docs) {
            if (err)
                throw (err);
            callback(null, doc);
        });
    });

};


exports.joinEntityOrganization = function(req, callback) {

    if (!mongoose.Types.ObjectId.isValid(req.params.oid))
        callback({
            "error": ["Invalid Organization Id"],
            "code": 400
        }, null);
    if (!mongoose.Types.ObjectId.isValid(req.params.eid))
        callback({
            "error": ["Invalid Federation Entity Id"],
            "code": 400
        }, null);

    organization.findOne({
        _id: req.params.oid
    }, function(err, doc) {

        if (err)
            callback(err, null);
        if (doc == null)
            callback({
                "error": ["Organization doesn't exists"],
                "code": 404
            }, null);

        if (doc.entities.indexOf(req.params.eid) > -1)
            callback({
                "error": ["Federation Entity already exist"],
                "code": 404
            }, null);


        doc.entities.push(req.params.eid);
        var transaction = new Transaction();
        transaction.update('Organization', req.params.oid, doc);
        transaction.update('Federation_Entity', req.params.eid, {
            organizationId: req.params.oid
        });
        transaction.run(function(err, docs) {
            if (err)
                throw (err);
            callback(null, doc);
        });
    });

};