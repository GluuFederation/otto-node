// File : routes/organization.js -->


var express = require('express');
var router = express.Router();
var organizationController = require("../controller/organizationController");
var settings = require("../settings");
var baseURL = settings.baseURL;

/**
 * @swagger
 * resourcePath: /Organization
 * description: Open Trust Taxonomy for Federation Operators
 */


 /**
 * @swagger
 * path: /organization
 * operations:
 *   -  httpMethod: POST
 *      summary: Create Organization
 *      notes: Returns created organizationId
 *      nickname: organization
 *      consumes:
 *        - text/html
 *      parameters:
 *        - name: name
 *          description: Your Organization Name
 *          paramType: query
 *          required: true
 *          dataType: string
 */
router.post('/organization', function (req, res) {

  var organizationName= req.param('name');

  if (organizationName == "" || organizationName == undefined) {
      res.json({ status: '0', msg : 'Please enter organization Name.' });
      return;
  }

  organizationController.createOrganization(organizationName, function (err, data) {
      if (err) {
          res.json(500,{ status: '0', msg: 'There was an error reporting your issue.' });
          return;
      }
      else{
        res.json(200,{"id":baseURL+"/" + data[1][0].organizationId})
        //res.json(200,{"id":`{baseURL}/{data[1][0].organizationId}`});
      }
    });
});
module.exports = router;
