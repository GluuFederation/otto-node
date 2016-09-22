var federationmodel = require("../models/organizationmodel");
var mongoose = require('mongoose');
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
        // console.log('Federation data is valid');
        var ObjOrganization = new Organization(req.body);

        ObjOrganization.save(function(err, obj) {
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


exports.findOrganization = function(id, callback) {

     var query = Organization.findOne({_id: id}).select( '-_id -__v');

    query.exec( function(err, docs) {
        console.log(docs);
        if (err) callback(err, null);
        callback(null, docs);
    });

};


exports.deleteOrganization = function(id, callback) {
    console.log(id)


    Organization.find({
        _id: id
    }, "_id", function(err, docs) {
        console.log(docs);
        if (err) callback(err, null);

        if (docs.length == 0) {
            callback("Federation doesn't exist", null);
        }

        Organization.findOneAndRemove({
            _id: id
        }, function(err) {

            if (err) callback(err, null);
            callback(null);

    });
        });


};


exports.updateOrganizattion = function(req, callback) {


    var valid = ajv.validate(OrganizationAJVSchema, req.body);
    if (valid) {
        // console.log('Federation data is valid');
        Organization.findOneAndUpdate({
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