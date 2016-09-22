// File : routes/organization.js -->
var express = require('express');
var router = express.Router();
var settings = require("../settings");
var baseURL = settings.baseURL;
var OrganizationURL = settings.organization;
var organizationcontroller = require("../controller/organizationcontroller");
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
 *      notes: Returns created Organization Id
 *      nickname: Organization
 *      consumes:
 *        - text/html
 *      parameters:
 *        - body: name
 *          description: Your organization  JSON
 *          paramType: body
 *          required: true
 *          dataType: string
 */
router.post(OrganizationURL, function(req, res) {

    organizationcontroller.addOrganization(req, function(err, data) {
        console.log(err);
        if (err) {
            res.status(409).json({
                "Errors": err
            });
        } else {

            res.status(200).json({
                "@id": baseURL + OrganizationURL + "/" + data
            });
        }
    });

});

/**
 * @swagger
 * path: /otto/organization/{id}
 * operations:
 *   -  httpMethod: GET
 *      summary: Get organization  By Id
 *      notes: Returns organization 
 *      nickname: GetorganizationById
 *      parameters:
 *        - name: id
 *          paramType: path
 *          description: Your organization  Id
 *          required: true
 *          dataType: string
 */
router.get(OrganizationURL + '/:id', function(req, res) {

    //   console.log(req.params.id);

    organizationcontroller.findOrganization(req.params.id, function(err, data) {
        if (err) {

            res.status(409).json({
                "Errors": err
            });
        } else {

            res.status(200).json(data);
        }
    });

});


/**
 * @swagger
 * path: /otto/findOrganization
 * operations:
 *   -  httpMethod: GET
 *      summary: Get Organization 
 *      notes: Returns Organization 
 *      nickname: GetOrganization
 *
 */
router.get(OrganizationURL, function(req, res) {
    organizationcontroller.getAllOrganization(req, function(err, data) {
        if (err) {

            res.status(409).json(err);
        } else {

            res.status(200).json({
                Organization: data
            });
        }

    });


});



/**
 * @swagger
 * path: /otto/organization/{id}
 * operations:
 *   -  httpMethod: Delete
 *      summary: Delete organization 
 *      notes: Returns organization  status
 *      nickname: Deleteorganization
 *      consumes:
 *        - text/html
 *      parameters:
 *        - name: id
 *          description: Your organization Id
 *          paramType: path
 *          required: true
 *          dataType: string
 */
router.delete(OrganizationURL + '/:id', function(req, res) {

    organizationcontroller.deleteOrganization(req.params.id, function(err) {
        if (err) {

            res.status(409).json({
                "Error": err
            });
        } else {

            res.status(200).json();
        }

    });


});


/**
 * @swagger
 * path: /otto/organization/{id}
 * operations:
 *   -  httpMethod: PUT
 *      summary: Update organization
 *      notes: Returns Status
 *      nickname: Putorganization
 *      consumes:
 *        - text/html
 *      parameters:
 *        - name: id
 *          description: Your organization  Id
 *          paramType: path
 *          required: true
 *          dataType: string
 *        - name: body
 *          description: Your organization Information
 *          paramType: body
 *          required: true
 *          dataType: string
 *            
 */
router.put(OrganizationURL + "/:id", function(req, res) {

    organizationcontroller.updateFederationEntity(req, function(err, data) {
        console.log(err);
        if (err) {
            res.status(409).json({
                "Errors": err
            });
        } else {

            res.status(200).json();
        }
    });

});



module.exports = router;