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
        // console.log('Federation data is valid');
        var ObjFederationEntity = new FederationEntity(req.body);

        ObjFederationEntity.save(function(err, obj) {
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


exports.findFederationEntity = function(id, callback) {

     var query = FederationEntity.findOne({_id: id}).select( '-_id -__v');

    query.exec( function(err, docs) {
        console.log(docs);
        if (err) callback(err, null);
        callback(null, docs);
    });

};


exports.deleteFederationEntity = function(id, callback) {
    console.log(id)


    FederationEntity.find({
        _id: id
    }, "_id", function(err, docs) {
        console.log(docs);
        if (err) callback(err, null);

        if (docs.length == 0) {
            callback("Federation doesn't exist", null);
        }

        FederationEntity.findOneAndRemove({
            _id: id
        }, function(err) {

            if (err) callback(err, null);
            callback(null);

        });
    });


};


exports.updateFederationEntity = function(req, callback) {


    var valid = ajv.validate(FederationEntityAJVSchema, req.body);
    if (valid) {
        // console.log('Federation data is valid');
        FederationEntity.findOneAndUpdate({
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