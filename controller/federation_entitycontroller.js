var federationmodel = require("../models/federation_entitymodel");
var mongoose = require('mongoose');
var FederationEntity = mongoose.model('Federation_Entity');
var Common = require('../helpers/common');
var Ajv = require('ajv');
var ajv = Ajv({
    allErrors: true
});
var settings = require("../settings");
var baseURL = settings.baseURL;
var FederationEntityURL = settings.federation_entity;

var FederationEntityAJVSchema = {
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
  
    FederationEntity.find({}, "_id", function(err, docs) {
        //console.log(docs);
        var federationEntityArr = Array();
        docs.forEach(function(element) {
            federationEntityArr.push(baseURL + FederationEntityURL + "/" + element._id);
        });
        callback(null, federationEntityArr);
    });

};

exports.addFederationEntity = function(req, callback) {

    var valid = ajv.validate(FederationEntityAJVSchema, req.body);
    if (valid) {
    
        var ObjFederationEntity = new FederationEntity(req.body);
        ObjFederationEntity.save(function(err, obj) {
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


exports.findFederationEntity = function(req, callback) {

    if(!mongoose.Types.ObjectId.isValid(req.params.id))
        callback({ "error" :["Invalid Federation Entity Id"],"code" : 400}, null);

     var query = FederationEntity.findOne({_id: req.params.id}).select( '-_id -__v');

    query.exec( function(err, docs) {
        console.log(docs);
        if (err) throw(err);
        callback(null, docs);
    });

};


exports.deleteFederationEntity = function(req, callback) {

     if(!mongoose.Types.ObjectId.isValid(req.params.id))
        callback({ "error" :["Invalid Federation Entity Id"],"code" : 400}, null);

    FederationEntity.find({
        _id: req.params.id
    }, "_id", function(err, docs) {
        console.log(docs);
        if (err) callback(err, null);

        if (docs.length == 0) {
            callback({"error" :["Federation Entity doesn't exist"],"code" : 404}, null);
        }

        FederationEntity.findOneAndRemove({
            _id: req.params.id
        }, function(err) {

            if (err) callback(err, null);
            callback(null);

        });
    });


};


exports.updateFederationEntity = function(req, callback) {

     if(!mongoose.Types.ObjectId.isValid(req.params.id))
        callback({ "error" :["Invalid Federation Entity Id"],"code" : 400}, null);


    var valid = ajv.validate(FederationEntityAJVSchema, req.body);
    if (valid) {
        FederationEntity.findOneAndUpdate({
            _id: req.params.id
        }, req.body, function(err, data) {
            if (err) throw(err);
            //console.log(obj._id);
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