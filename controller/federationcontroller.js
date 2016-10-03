var federationmodel = require("../models/federationmodel");
var federationentitymodel = require("../models/federation_entitymodel");

var mongoose = require('mongoose');
var Federation = mongoose.model('Federation');
var FederationEntity = mongoose.model('Federation_Entity');
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
            Federation.find({}).select('-__v -_id').lean().exec( function(err, docs) {
            //var finalFedArr = [];
            if(err) throw err;    
            for(var i =0 ;i<docs.length;i++)
            {
                //var data = docs[i]._doc;
                docs[i]["Organization"] = settings.baseURL + settings.organization+"/"+docs[i].organizationId;
                delete docs[i].organizationId;
                for(var j=0;j<docs[i].entities.length;j++)
                {
                    docs[i].entities[j] =  settings.baseURL + settings.federation_entity+"/"+docs[i].entities[j];
                }
               // finalFedArr.push(docs[i]);
            }
            callback(null, docs);
        });
    }
    else if(req.query.depth=='federation.entities'){
        Federation.find({}).select('-__v -_id').populate({path :'entities',select :'-_id -__v'}).lean().exec( function(err, docs) {
            //var finalFedArr = [];    
            for(var i =0 ;i<docs.length;i++)
            {
              //  var data = docs[i]._doc;
                if(docs[i].hasOwnProperty("organizationId"))
                {
                    docs[i]["Organization"] = settings.baseURL + settings.organization+"/"+docs[i].organizationId;
                    delete docs[i].organizationId;
                }
               // data.entities = data.entities._doc;
                //var entitiesArr = [];
                for(var j=0;j<docs[i].entities.length;j++)
                {
                   // var entitydata = docs[i].entities[j]._doc;
                   if(docs[i].entities[j].hasOwnProperty("organizationId"))
                   {
                        docs[i].entities[j]["Organization"] =  settings.baseURL + settings.organization+"/"+docs[i].entities[j].organizationId;
                        delete docs[i].entities[j].organizationId;
                   }
                  //  entitiesArr.push(entitydata);
                }
               // data.entities = entitiesArr;
                //finalFedArr.push(data);
            }
            callback(null, docs);
           
        });
    }
    else if(req.query.depth=='federation.entities.organization'){
        Federation.find({}).select('-__v -_id').populate({path :'organizationId',select :'name @id -_id'}).lean().exec( function(err, docs) {
            //var finalFedArr = [];    

            Federation.deepPopulate(docs, 'entities.organizationId', function (err, _posts) {
            
            callback(null, _posts);
                
            });
        
           
        });
    }
    else if(req.query.depth == 'federation.organization')
    {
        Federation.find({}).select('-__v -_id').populate({path :'organizationId',select :'name @id -_id'}).exec( function(err, docs) {
        // var finalFedArr = [];    
            for(var i =0 ;i<docs.length;i++)
            {
               // var data = docs[i]._doc;
               // data["Organization"] = settings.baseURL + settings.organization+"/"+data.organizationId;
             //  
               // data.entities = data.entities._doc;
              //  var entitiesArr = [];
                if(docs[i].organizationId!=undefined){
                    docs[i]["Organization"] = docs[i].organizationId;
                    delete docs[i].organizationId;
                }
                for(var j=0;j<docs[i].entities.length;j++)
                {
                    docs[i].entities[j] =  settings.baseURL + settings.federation_entity+"/"+docs[i].entities[j];
                }
               // finalFedArr.push(data);
            }
            callback(null, docs);    
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
   
    Federation.findOne({_id: req.params.id}).select('-__v -_id').populate({path :'entities',select :'name @context @id -_id'}).populate({path:'organizationId',select:'name @context @id -_id'}).lean().exec(function (err, federation) {
         if (err) throw(err);
         if(federation == undefined || federation == null)
         {
               callback({ "error" :["Federation doesn't exist"],"code" : 404}, null);
         }
        federation["organization"] = federation["organizationId"];
        delete federation.organizationId;
        
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
        
        Federation.findOne({_id: req.params.id}).exec(function(err,doc){

        if(err)
        {
            throw (err);
        }
        else if(doc == null || doc == undefined)
        {
             callback({ "error" :["Federation doesn't exist"],"code" : 404}, null);
        }
        else{    
            Federation.findOneAndUpdate({
                _id: req.params.id
            }, req.body, function(err, data) {
                if (err)throw(err);
                  callback(null, data);
            });
        
        }
        });
    } else {
        
        var errorMsg = Array();
        ajv.errors.forEach(function(element) {
            errorMsg.push(element.message);
        });
        callback({ "error" :errorMsg,"code" : 400}, null);
    }

};

exports.joinFederation = function(req,callback){
   
    if(!mongoose.Types.ObjectId.isValid(req.params.fid))
        callback({ "error" :["Invalid Federation Id"],"code" : 400}, null);
     if(!mongoose.Types.ObjectId.isValid(req.params.eid))
         callback({ "error" :["Invalid Federation Entity Id"],"code" : 400}, null);
     Federation.findOne({_id: req.params.fid}, function(err, doc) {
        if (err) 
           throw(err);
        if(doc==null)
             callback("Federation doesn't exist", null);

          if(doc.entities.indexOf(req.params.eid) > -1)
            callback({ "error" :["Federation Entity already exist"],"code" : 400}, null);     
        var query = FederationEntity.findOne({_id: req.params.eid}).select( '-_id -__v');

    query.exec( function(err, docs) {
       if (err) throw(err);
       if(docs == null || docs== undefined)
          callback({ "error" :["Federation Entity doesn't exist"],"code" : 404}, null);
       else{
    doc.entities.push(req.params.eid);
        doc.save();     
        callback(null,doc);
       }        
      
    });   
});

};

exports.leaveFederation = function(req,callback){
     
     if(!mongoose.Types.ObjectId.isValid(req.params.fid))
        callback('Invalid Federation Id');
     if(!mongoose.Types.ObjectId.isValid(req.params.eid))
        callback('Invalid Federation Entity Id');  

     Federation.findOne({_id: req.params.fid}, function(err, doc) {

        if (err) 
            callback(err, null);
        if(doc==null)
            callback({"error" :["Federation doesn't exist"],"code" : 404}, null);
        
        var index = doc.entities.indexOf(req.params.eid);
        if (index > -1) {
            doc.entities.splice(index, 1);
            doc.save();     
            callback(null,doc);
        }
        else{
           callback({"error" :['Entity doesn\'t exist in Federation'],"code" : 404}, null);
        }
   });
};

