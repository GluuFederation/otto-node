var federationmodel = require("../models/federationmodel");
var mongoose = require('mongoose');
var Federation = mongoose.model('Federation');
var Common = require('../helpers/common');
var Ajv = require('ajv');
var ajv = Ajv({
    allErrors: true
});
var settings = require("../settings");
var baseURL = settings.baseURL;
var FederationURL = settings.federations;


var FederationAJVSchema = {
    "properties": {
      
        "name": {
            "type": "string"
        },
    },
    "required": [ "name"]
}

exports.getAllFederation = function(req, callback) {

    console.log("getAllFederation Called");
    Federation.find({}, "_id", function(err, docs) {
        //console.log(docs);
        var federationsArr = Array();
        docs.forEach(function(element) {
            federationsArr.push(baseURL + FederationURL + "/" + element._id);
        });
        callback(null, federationsArr);
    });

};

exports.addFederation = function(req, callback) {

    console.log(FederationAJVSchema);
    console.log(req.body);

    var valid = ajv.validate(FederationAJVSchema, req.body);
    if (valid) {
        // console.log('Federation data is valid');
        var ObjFederation = new Federation(req.body);
        
        ObjFederation.save(function(err, obj) {
            if (err) callback(err, null);
            //console.log(obj._id);
            callback(null, obj._id);

        });
    } else {
        //console.log('Federation data is INVALID!');
        var errorMsg = Array();
        ajv.errors.forEach(function(element) {
            errorMsg.push(element.message);
        });
        callback(errorMsg), null;
    }

};


exports.findFederation = function(id, callback) {

    Federation.findOne({_id: id}).select('-__v -_id').populate({path :'entites',select :'name @context @id -_id'}).exec(function (err, federation) {
         if (err) callback(err, null);
         callback(null, federation);
    });

//   Federation.find({_id: id}, function(err, docs) {
//         console.log(docs);
//         if (err) callback(err, null);
//         callback(null, docs);
//     });

};


exports.deleteFederation = function(id, callback) {
    console.log(id)


    Federation.find({
        _id: id
    }, "_id", function(err, docs) {
        console.log(docs);
        if (err) callback(err, null);

        if (docs.length == 0) {
            callback("Federation doesn't exist", null);
        }

        Federation.findOneAndRemove({
            _id: id
        }, function(err) {

            if (err) callback(err, null);
            callback(null);
        });
    });
};


exports.updateFederation = function(req, callback) {


    var valid = ajv.validate(FederationAJVSchema, req.body);
    if (valid) {
        // console.log('Federation data is valid');
        Federation.findOneAndUpdate({
            _id: req.params.id
        }, req.body, function(err, data) {
            if (err) callback(err, null);
            //console.log(obj._id);
            callback(null, data);
        });


    } else {
        //console.log('Federation data is INVALID!');
        var errorMsg = Array();
        ajv.errors.forEach(function(element) {
            errorMsg.push(element.message);
        });
        callback(errorMsg, null);
    }

};

exports.leaveFederation = function(req,callback){
    var fid = req.params.fid;
    var eid = req.params.eid;

    console.log(req.params.fid);
    console.log(req.params.eid);
}


exports.joinFederation = function(fid,eid,callback){
   
    console.log('Controller -- eid ' + eid);
     Federation.findOne({
        _id: fid
    }, function(err, doc) {
        
        if (err) 
            callback(err, null);
        if(doc==null)
             callback("Federation doesn't exist", null);

        //console.log(doc);    
        doc.entites.push(eid);
        doc.save();     
        callback(null,doc);

    });

}

exports.leaveFederation = function(fid,eid,callback){
   
    console.log('Controller -- eid ' + eid);
     Federation.findOne({
        _id: fid
    }, function(err, doc) {
        
        if (err) 
            callback(err, null);
        if(doc==null)
             callback("Federation doesn't exist", null);

        //console.log(doc);
        var index = doc.entites.indexOf(eid);
        if (index > -1) {
            doc.entites.splice(index, 1);
            doc.save();     
            callback(null,doc);
        }
        else{
            callback('Entity doesn\'t exist in Federation',null)
        }
       // doc.entites.pull(eid);
 
   });

}