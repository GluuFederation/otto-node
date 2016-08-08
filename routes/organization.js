// File : routes/organization.js -->
var express = require('express');
var router = express.Router();
var organizationController = require("../controller/organizationController");
var settings = require("../settings");
var baseURL = settings.baseURL;
var organizationEndPointPath = settings.organization;

/**
 * @swagger
 * resourcePath: /Organization
 * description: Open Trust Taxonomy for Federation Operators
 */


 /**
 * @swagger
 * path: /otto/organization
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
router.post(settings.organization, function (req, res) {

  var organizationName= req.param('name');

  if (organizationName == "" || organizationName == undefined) {
      res.json({ status: '0', msg : 'Organization name is required.' });
      return;
  }

  organizationController.createOrganization(organizationName, function (err, data) {
      if (err) {
          res.json(500,{ status: '0', msg: 'There was an error reporting your issue.' });
          return;
      }
      else{
        res.json(200,{"id":baseURL+organizationEndPointPath+"/" + data[1][0].organizationId})
      }
    });
});
module.exports = router;


/**
* @swagger
* path: /otto/organization/{id}
* operations:
*   -  httpMethod: GET
*      summary: Get Organization
*      notes: Returns Organization
*      nickname: GetOrganization
*      parameters:
*        - name: id
*          paramType: path
*          description: Your Organization Id
*          required: true
*          dataType: string
*/
router.get('/otto/organization/:id', function (req, res) {
  var organizationId= req.params.id;
 if (organizationId == "" || organizationId == undefined) {
     res.json({ status: '0', msg : 'Organization id is required.' });
     return;
 }

 organizationController.getOrganizationById(organizationId, function (err, data) {
     if (err) {
         res.json(500,{ status: '0', msg: 'There was an error reporting your issue.' });
         return;
     }
     else{
       res.json(200,{'@context': settings.contextSchema + settings.contextOrganization,'@id': data[0]['@id'] , 'name': data[0].organizationName})
     }
   });
});
module.exports = router;
