var federationmodel = require("../models/organizationmodel");
var mongoose = require('mongoose');
var Transaction = require('mongoose-transaction')(mongoose);
var Organization = mongoose.model('Organization');
var Common = require('../helpers/common');
var Ajv = require('ajv');
var ajv = Ajv({
    allErrors: true
});
var settings = require("../settings");
var baseURL = settings.baseURL;
var OrganizationURL = settings.organization;

var OrganizationAJVSchema = {
    "properties": {
        "name": {
            "type": "string"
        },
    },
    "required": ["name"]
}

exports.getAllOrganization = function(req, callback) {
  
    Organization.find({}, "_id", function(err, docs) {
        //console.log(docs);
        var organizationArr = Array();
        docs.forEach(function(element) {
            organizationArr.push(baseURL + OrganizationURL + "/" + element._id);
        });
        callback(null, organizationArr);
    });

};

exports.addOrganization = function(req, callback) {

    var valid = ajv.validate(OrganizationAJVSchema, req.body);
    if (valid) {
        var ObjOrganization = new Organization(req.body);

        ObjOrganization.save(function(err, obj) {
            if (err) throw(err);
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


exports.findOrganization = function(req, callback) {

     if(!mongoose.Types.ObjectId.isValid(req.params.id))
        callback({ "error" :["Invalid Organization Id"],"code" : 400}, null);

     var query = Organization.findOne({_id: req.params.id}).select( '-_id -__v');//.populate({path:'federations',select:'@id name -_id'});
     query.exec( function(err, docs) {
     if (err) throw(err);
     var data = JSON.parse(JSON.stringify(docs._doc));
     for(var i=0;i<data.federations.length;i++)
     {
         data.federations[i] = settings.baseURL + settings.federations + "/" +  data.federations[i];
     }
     for(var i=0;i<data.entities.length;i++)
     {
         data.entities[i] = settings.baseURL + settings.federation_entity + "/" +  data.entities[i];
     }
     callback(null, data);
   });
};


exports.deleteOrganization = function(req, callback) {

    if(!mongoose.Types.ObjectId.isValid(req.params.id))
        callback({ "error" :["Invalid Organization Id"],"code" : 400}, null);

    Organization.find({_id: req.params.id}, "_id", function(err, docs) {
        
        if (err) 
            throw(err);
        
        if (docs.length == 0)
           callback({ "error" :["Organization doesn't exists"],"code" : 404}, null);
        
        Organization.findOneAndRemove({
            _id: req.params.id
        }, function(err) {
            if (err)  throw(err);
            callback(null);
       });
  });

};


exports.updateOrganizattion = function(req, callback) {

    if(!mongoose.Types.ObjectId.isValid(req.params.id))
        callback({ "error" :["Invalid Organization Id"],"code" : 400}, null);

    var valid = ajv.validate(OrganizationAJVSchema, req.body);
    if (valid) {
        
        Organization.findOneAndUpdate({_id: req.params.id}, req.body, function(err, data) {
            if (err) 
               throw(err);
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

exports.joinFederationOrganization = function(req,callback){

    if(!mongoose.Types.ObjectId.isValid(req.params.oid))
        callback({ "error" :["Invalid Organization Id"],"code" : 400}, null);
     if(!mongoose.Types.ObjectId.isValid(req.params.fid))
         callback({ "error" :["Invalid Federation Id"],"code" : 400}, null);
    
     Organization.findOne({_id: req.params.oid}, function(err, doc) {
        
        if (err) 
            callback(err, null);
        if(doc==null)
           callback({ "error" :["Organization doesn't exists"],"code" : 404}, null);
       
        // if(doc.federations.indexOf(req.params.fid) > -1)
        //     callback({ "error" :["Federation already exist"],"code" : 404}, null);
        
       
      //  doc.federations.push(req.params.fid);
        var transaction = new Transaction();
        transaction.update('Organization',doc);
        transaction.update('Federation', req.params.fid, {organizationId:req.params.oid});
        transaction.run(function(err, docs){
            if(err)           
                throw(err);
            callback(null,doc);
        });              
    });

};


exports.joinEntityOrganization = function(req,callback){

    if(!mongoose.Types.ObjectId.isValid(req.params.oid))
        callback({ "error" :["Invalid Organization Id"],"code" : 400}, null);
     if(!mongoose.Types.ObjectId.isValid(req.params.eid))
         callback({ "error" :["Invalid Federation Entity Id"],"code" : 400}, null);
    
     Organization.findOne({_id: req.params.oid}, function(err, doc) {
        
        if (err) 
            callback(err, null);
        if(doc==null)
           callback({ "error" :["Organization doesn't exists"],"code" : 404}, null);
       
        if(doc.entities.indexOf(req.params.eid) > -1)
            callback({ "error" :["Federation Entity already exist"],"code" : 404}, null);
           
            
        doc.entities.push(req.params.eid);
        var transaction = new Transaction();
        transaction.insert('Organization',doc);
        transaction.update('Federation_Entity', req.params.eid, {organizationId:req.params.oid});
        transaction.run(function(err, docs){
            if(err)           
                throw(err);
            callback(null,doc);
        });              
    });

};
