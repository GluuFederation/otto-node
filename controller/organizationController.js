// File : controller/organizationController.js -->
var settings = require("../settings");
var baseURL = settings.baseURL;
var organizationEndPointPath = settings.organization;
var db = require("../core/db");

/*---------------------------------------------------
METHOD NAME : Create Organization
METHOD TYPE : POST
---------------------------------------------------*/
exports.createOrganization = function(organizationName, callback){
  var query = 'insert into organization(organizationId,organizationName) values(uuid(),"' + organizationName + '") ; SELECT * FROM organization WHERE id=LAST_INSERT_ID();';
  db.executeSql(query, function (err, data) {
        if (!err) {
            callback(null, data);
        }
        else {
          callback(err, null);
        }
    });
};
/*---------------------------------------------------
METHOD NAME : Get all organizaion
METHOD TYPE : GET
---------------------------------------------------*/
exports.getAllOrganization = function(callback){
  var query = 'Select CONCAT("'+ baseURL+organizationEndPointPath+'/", organizationId) AS organization  FROM organization';
  db.executeSql(query, function (err, data) {
        if (!err) {
            callback(null, data);
        }
        else {
          callback(err, null);
        }
    });
};
