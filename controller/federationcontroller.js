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
var ObjectId = require('mongoose').ObjectId;

var FederationAJVSchema = {
    "properties": {
      
        "name": {
            "type": "string"
        },
    },
    "required": [ "name"]
}

exports.getAllFederation = function(req, callback) {
    
    if(req.query.depth==null)
    {
        Federation.find({}, "_id", function(err, docs) {
            var federationsArr = Array();
            docs.forEach(function(element) {
                federationsArr.push(baseURL + FederationURL + "/" + element._id);
            });
            callback(null, federationsArr);
        });
    }
    else if(req.query.depth=='federation'){
        //Federation.find({}).select('-__v -_id').populate({path :'entities',select :'@id -_id'}).populate({path:'organizationId'}).exec( function(err, docs) {
            Federation.find({}).select('-__v -_id').exec( function(err, docs) {
            var finalFedArr = [];    
            for(var i =0 ;i<docs.length;i++)
            {
                var data = docs[i]._doc;
                data["Organization"] = settings.baseURL + settings.organization+"/"+data.organizationId;
                delete data.organizationId;
                for(var j=0;j<data.entities.length;j++)
                {
                    data.entities[j] =  settings.baseURL + settings.federation_entity+"/"+data.entities[j];
                }
                finalFedArr.push(data);
            }
            callback(null, finalFedArr);
        });
    }
    else if(req.query.depth=='federation.entities'){
        Federation.find({}).select('-__v -_id').populate({path :'entities',select :'-_id -__v'}).exec( function(err, docs) {
            var finalFedArr = [];    
            for(var i =0 ;i<docs.length;i++)
            {
                var data = docs[i]._doc;
                data["Organization"] = settings.baseURL + settings.organization+"/"+data.organizationId;
                delete data.organizationId;
               // data.entities = data.entities._doc;
                var entitiesArr = [];
                for(var j=0;j<data.entities.length;j++)
                {
                    var entitydata = data.entities[j]._doc;
                    entitydata["Organization"] =  settings.baseURL + settings.organization+"/"+entitydata.organizationId;
                    delete entitydata.organizationId;
                    entitiesArr.push(entitydata);
                }
                data.entities = entitiesArr;
                finalFedArr.push(data);
            }
            callback(null, finalFedArr);
           
        });
    }
    else if(req.query.depth == 'federation.organization')
    {
        Federation.find({}).select('-__v -_id').populate({path :'organizationId',select :'name @id -_id'}).exec( function(err, docs) {
         var finalFedArr = [];    
            for(var i =0 ;i<docs.length;i++)
            {
                var data = docs[i]._doc;
               // data["Organization"] = settings.baseURL + settings.organization+"/"+data.organizationId;
             //  
               // data.entities = data.entities._doc;
                var entitiesArr = [];
                if(data.organizationId!=undefined){
                    data["Organization"] = data.organizationId._doc;
                    delete data.organizationId;
                }
                for(var j=0;j<data.entities.length;j++)
                {
                    data.entities[j] =  settings.baseURL + settings.federation_entity+"/"+data.entities[j];
                }
                finalFedArr.push(data);
            }
            callback(null, finalFedArr);    
        });
    }
    else {
        callback({"error" :['unknown value for depth parameter'],"code" : 400 },null);
    }
};

exports.addFederation = function(req, callback) {

    var valid = ajv.validate(FederationAJVSchema, req.body);
    if (valid) {
        var ObjFederation = new Federation(req.body);
        ObjFederation.save(function(err, obj) {
            if (err) throw(err)
            callback(null, obj._id);
        });
    } else {
        var errorMsg = Array();
        ajv.errors.forEach(function(element) {
            errorMsg.push(element.message);
        });
        callback({ "error" :errorMsg,"code" : 400}, null);
    }

};


exports.findFederation = function(req, callback) {

    if(!mongoose.Types.ObjectId.isValid(req.params.id))
        callback({ "error" :["Invalid Federation Id"],"code" : 400}, null);
   
    Federation.findOne({_id: req.params.id}).select('-__v -_id').populate({path :'entities',select :'name @context @id -_id'}).populate({path:'organizationId',select:'name @context @id -_id'}).exec(function (err, federation) {
         if (err) throw(err);
         callback(null, federation);
    });

};


exports.deleteFederation = function(req, callback) {
     if(!mongoose.Types.ObjectId.isValid(req.params.id))
        callback({ "error" :["Invalid Federation Id"],"code" : 400}, null);
     Federation.find({_id: req.params.id}, "_id", function(err, docs) {
        if (err) throw(err);

        if (docs.length == 0) {
            callback({"error" :["Federation doesn't exist"],"code" : 404}, null);
        }
        Federation.findOneAndRemove({_id: req.params.id}, function(err) {
            if (err) callback(err, null);
            callback(null);
        });
    });
};


exports.updateFederation = function(req, callback) {

 if(!mongoose.Types.ObjectId.isValid(req.params.id))
         callback({ "error" :["Invalid Federation Id"],"code" : 400}, null);

    var valid = ajv.validate(FederationAJVSchema, req.body);
    if (valid) {
        
        Federation.findOneAndUpdate({
            _id: req.params.id
        }, req.body, function(err, data) {
            if (err)throw(err);
        
            callback(null, data);
        });


    } else {
        
        var errorMsg = Array();
        ajv.errors.forEach(function(element) {
            errorMsg.push(element.message);
        });
        callback({ "error" :errorMsg,"code" : 400}, null);
    }

};

exports.joinFederation = function(fid,eid,callback){
   
    if(!mongoose.Types.ObjectId.isValid(fid))
        callback({ "error" :["Invalid Federation Id"],"code" : 400}, null);
     if(!mongoose.Types.ObjectId.isValid(eid))
         callback({ "error" :["Invalid Federation Entity Id"],"code" : 400}, null);
     Federation.findOne({_id: fid}, function(err, doc) {
        if (err) 
           throw(err);
        if(doc==null)
             callback("Federation doesn't exist", null);

          if(doc.entities.indexOf(eid) > -1)
            callback({ "error" :["Federation Entity already exist"],"code" : 404}, null);     

        doc.entities.push(eid);
        doc.save();     
        callback(null,doc);

    });

}

exports.leaveFederation = function(fid,eid,callback){
     
     if(!mongoose.Types.ObjectId.isValid(fid))
        callback('Invalid Federation Id');
     if(!mongoose.Types.ObjectId.isValid(eid))
        callback('Invalid Federation Entity Id');  

     Federation.findOne({_id: fid}, function(err, doc) {

        if (err) 
            callback(err, null);
        if(doc==null)
            callback({"error" :["Federation doesn't exist"],"code" : 404}, null);
        
        var index = doc.entities.indexOf(eid);
        if (index > -1) {
            doc.entities.splice(index, 1);
            doc.save();     
            callback(null,doc);
        }
        else{
           callback({"error" :['Entity doesn\'t exist in Federation'],"code" : 404}, null);
        }
   });
}