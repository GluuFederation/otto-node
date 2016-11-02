// File : routes/federations.js -->
var express = require('express');
var router = express.Router();
var settings = require("../settings");
var baseURL = settings.baseURL;
var federationEntityURL = settings.federation_entity;
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
 *        - name: FederationEntity Json
 *          description: Your Federation Entity JSON
 *          paramType: body
 *          required: true
 *          dataType: string
 */
router.post(federationEntityURL, function(req, res) {

    try{
    federationentitycontroller.addFederationEntity(req, function(err, data) {
        console.log(err);
        if (err) {
           res.status(err.code).json({"Error(s)": err.error});
        } else {

            res.status(201).json({
                "@id": baseURL + federationEntityURL + "/" + data
            });
        }
    });
    }catch(e){
        res.status(500).json();
    }
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
 *        - name: depth
 *          description: depth[entities.organization]
 *          paramType: query
 *          required: false
 *          dataType: string
 *        - name: filter
 *          description: jspath filter syntax
 *          paramType: query
 *          required: false
 *          dataType: string  
 * 
 */
router.get(federationEntityURL + '/:id', function(req, res) {

    try{
    federationentitycontroller.findFederationEntity(req, function(err, data) {
        if (err) {
            res.status(err.code).json({"Error(s)": err.error});
        } else {
            res.status(200).json(data);
        }
    });
    }catch(e){
        res.status(500).json();
    }
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
 *         description: depth[federation_entity,federation_entity.organization]
 *         paramType: query
 *         required: false
 *         dataType: string
 *       - name: pageno
 *         description: pageno (Starts from 0)
 *         paramType: query
 *         required: false
 *         dataType: string
 *       - name: pagelength
 *         description: page length
 *         paramType: query
 *         required: false
 *         dataType: string
 *      
 *
 */
router.get(federationEntityURL, function(req, res) {
    try{
    federationentitycontroller.getAllFederationEntityWithDepth(req, function(err, data) {
        if (err) {

           res.status(err.code).json({"Error(s)": err.error});
        } else {
                res.status(200).json({
                federation_entity: data
            });
        }
    });
    }catch(e){
        res.status(500).json();
    }
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
router.delete(federationEntityURL + '/:id', function(req, res) {
    try{
    federationentitycontroller.deleteFederationEntity(req, function(err) {
        if (err) {
           res.status(err.code).json({"Error(s)": err.error});
        } else {
            res.status(200).json();
        }
    });
    }
    catch(e){
        res.status(500).json();
    }
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
router.put(federationEntityURL + "/:id", function(req, res) {
    try{
    federationentitycontroller.updateFederationEntity(req, function(err, data) {
        console.log(err);
        if (err) {
           res.status(err.code).json({"Error(s)": err.error});
        } else {

            res.status(200).json();
        }
    });
}catch(e){
        res.status(500).json();
    }
});



module.exports = router;