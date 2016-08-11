// File : controller/organizationController.js -->
var settings = require("../settings");
var baseURL = settings.baseURL;
var organizationEndPointPath = settings.organization;
var db = require("../core/db");

/*---------------------------------------------------
METHOD NAME : Create Organization
METHOD TYPE : POST
---------------------------------------------------*/
exports.createOrganization = function(organizationName, callback) {
    var query = 'insert into organization(organizationId,organizationName) values(uuid(),"' + organizationName + '") ; SELECT * FROM organization WHERE id=LAST_INSERT_ID();';
    db.executeSql(query, function(err, data) {
        if (!err) {
            callback(null, data);
        } else {
            callback(err, null);
        }
    });
};
/*---------------------------------------------------
METHOD NAME : Get all organizaion
METHOD TYPE : GET
---------------------------------------------------*/
exports.getAllOrganization = function(callback) {
    var query = 'Select CONCAT("' + baseURL + organizationEndPointPath + '/", organizationId) as id FROM organization';
    db.executeSql(query, function(err, data) {
        if (!err) {
            callback(null, data);
        } else {
            callback(err, null);
        }
    });
};
/*---------------------------------------------------
METHOD NAME : Get organizaion by Id
METHOD TYPE : GET
---------------------------------------------------*/
exports.getOrganizationById = function(organizationId, callback) {
    var query = 'Select CONCAT("' + baseURL + organizationEndPointPath + '/", organizationId) AS "@id" , organizationName  FROM organization Where organizationId = "' + organizationId + '"';
    db.executeSql(query, function(err, data) {
        if (!err) {
            callback(null, data);
        } else {
            callback(err, null);
        }
    });
};

/*---------------------------------------------------
METHOD NAME : Delete organization
METHOD TYPE : POST
---------------------------------------------------*/
exports.deleteOrganization = function(organizationId, callback) {
    var query = 'delete from organization WHERE  organizationId ="' + organizationId + '"';
    db.executeSql(query, function(err, data) {
        if (!err) {
            callback(null, data);
        } else {
            callback(err, null);
        }
    });
};
