// File : routes/federations.js -->
var express = require('express');
var router = express.Router();
var settings = require("../settings");
var baseURL = settings.baseURL;
var FederationEntityURL = settings.federation_entity;
var federationentitycontroller = require("../controller/federation_entitycontroller");

/**
 * @swagger
 * resourcePath: /FederationsEntity
 * description: Open Trust Taxonomy for Federation Operators
 */


/**
 * @swagger
 * path: /otto/federation_entity
 * operations:
 *   -  httpMethod: POST
 *      summary: Create Federation Entity
 *      notes: Returns created Federation Entity Id
 *      nickname: FederationsEntity
 *      consumes:
 *        - text/html
 *      parameters:
 *        - body: name
 *          description: Your Federation Entity JSON
 *          paramType: body
 *          required: true
 *          dataType: string
 */
router.post(FederationEntityURL, function(req, res) {

    federationentitycontroller.addFederationEntity(req, function(err, data) {
        console.log(err);
        if (err) {
           res.status(err.code).json({"Error(s)": err.error});
        } else {

            res.status(201).json({
                "@id": baseURL + FederationEntityURL + "/" + data
            });
        }
    });

});

/**
 * @swagger
 * path: /otto/federation_entity/{id}
 * operations:
 *   -  httpMethod: GET
 *      summary: Get Federations Entity By Id
 *      notes: Returns Federations Entity
 *      nickname: GetFederationsEntityById
 *      parameters:
 *        - name: id
 *          paramType: path
 *          description: Your Federation Entity Id
 *          required: true
 *          dataType: string
 */
router.get(FederationEntityURL + '/:id', function(req, res) {

    federationentitycontroller.findFederationEntity(req, function(err, data) {
        if (err) {

            res.status(err.code).json({"Error(s)": err.error});
        } else {

            res.status(200).json(data);
        }
    });

});


/**
 * @swagger
 * path: /otto/federation_entity
 * operations:
 *   -  httpMethod: GET
 *      summary: Get Federations Entity
 *      notes: Returns Federations Entity
 *      nickname: GetFederationsEntity
 *      parameters:
 *       - name: depth
 *         description: depth[entities,entities.organization]
 *         paramType: query
 *         required: false
 *         dataType: string
 *      
 *
 */
router.get(FederationEntityURL, function(req, res) {
    federationentitycontroller.getAllFederationEntity(req, function(err, data) {
        if (err) {

           res.status(err.code).json({"Error(s)": err.error});
        } else {
                res.status(200).json({
                Federation_Entity: data
            });
        }
    });
});


/**
 * @swagger
 * path: /otto/federation_entity/{id}
 * operations:
 *   -  httpMethod: Delete
 *      summary: Delete federations Entity
 *      notes: Returns federations Entity status
 *      nickname: DeleteFederationEntity
 *      consumes:
 *        - text/html
 *      parameters:
 *        - name: id
 *          description: Your federations Id
 *          paramType: path
 *          required: true
 *          dataType: string
 */
router.delete(FederationEntityURL + '/:id', function(req, res) {

    federationentitycontroller.deleteFederationEntity(req, function(err) {
        if (err) {
           res.status(err.code).json({"Error(s)": err.error});
        } else {
            res.status(200).json();
        }
    });

});


/**
 * @swagger
 * path: /otto/federation_entity/{id}
 * operations:
 *   -  httpMethod: PUT
 *      summary: Update federations
 *      notes: Returns Status
 *      nickname: PutFederationEntity
 *      consumes:
 *        - text/html
 *      parameters:
 *        - name: id
 *          description: Your federations Entity Id
 *          paramType: path
 *          required: true
 *          dataType: string
 *        - name: body
 *          description: Your federations Entity Information
 *          paramType: body
 *          required: true
 *          dataType: string
 *            
 */
router.put(FederationEntityURL + "/:id", function(req, res) {

    federationentitycontroller.updateFederationEntity(req, function(err, data) {
        console.log(err);
        if (err) {
           res.status(err.code).json({"Error(s)": err.error});
        } else {

            res.status(200).json();
        }
    });

});



module.exports = router;