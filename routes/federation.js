// File : routes/federations.js -->
var express = require('express');
var router = express.Router();
var settings = require("../settings");
var baseURL = settings.baseURL;
var federationURL = settings.federations;
var federationcontroller = require("../controller/federationcontroller");
var federationentitycontroller = require("../controller/federation_entitycontroller");

/**
 * @swagger
 * resourcePath: /Federations
 * description: Open Trust Taxonomy for Federation Operators
 */


/**
 * @swagger
 * path: /otto/federations
 * operations:
 *   -  httpMethod: POST
 *      summary: Create Federation
 *      notes: Returns created FederationId
 *      nickname: Federations
 *      consumes:
 *        - text/html
 *      parameters:
 *        - body: name
 *          description: Your Federation JSON
 *          paramType: body
 *          required: true
 *          dataType: string
 */
router.post(settings.federations, function(req, res) {

    federationcontroller.addFederation(req, function(err, data) {
        console.log(err);
        if (err) {
           res.status(err.code).json({"Error(s)": err.error});
        } else {
            res.status(201).json({
                "@id": baseURL + federationURL + "/" + data
            });
        }
    });

});

/**
 * @swagger
 * path: /otto/federations/{id}
 * operations:
 *   -  httpMethod: GET
 *      summary: Get Federation By ID
 *      notes: Returns Federations
 *      nickname: GetFederations
 *      parameters:
 *        - name: id
 *          paramType: path
 *          description: Your Federation Id
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
router.get(settings.federations + '/:id', function(req, res) {

   federationcontroller.findFederation(req, function(err, data) {
        if (err) {
            res.status(err.code).json({"Error(s)": err.error});
        } else {
            res.status(200).json(
                 data
            );
        }
    });
});


/**
 * @swagger
 * path: /otto/federations
 * operations:
 *   -  httpMethod: GET
 *      summary: Get Federations
 *      notes: Returns Federations
 *      nickname: GetFederations
 *      parameters:
 *        - name: depth
 *          description: depth[federations,federations.entities,federations.organization,federations.entities.organization]
 *          paramType: query
 *          required: false
 *          dataType: string
 *      
 */
router.get(settings.federations, function(req, res) {
    federationcontroller.getAllFederation(req, function(err, data) {
        if (err) {
            
             res.status(err.code).json({"Error(s)": err.error});

        } else {

            res.status(200).json({
                '@context' : baseURL + '/otto/federation_list',
                federations: data
            });
        }

    });


});

/**
 * @swagger
 * path: /otto/federations/{id}
 * operations:
 *   -  httpMethod: Delete
 *      summary: Delete federation
 *      notes: Returns federations status
 *      nickname: federations
 *      consumes:
 *        - text/html
 *      parameters:
 *        - name: id
 *          description: Your federations Id
 *          paramType: path
 *          required: true
 *          dataType: string
 *       
 */
router.delete(settings.federations + '/:id', function(req, res) {

    federationcontroller.deleteFederation(req, function(err) {
        if (err) {
           res.status(err.code).json({"Error(s)": err.error});
        } else {
            res.status(200).json();
        }
    });
});


/**
 * @swagger
 * path: /otto/federations/{id}
 * operations:
 *   -  httpMethod: PUT
 *      summary: Update federation
 *      notes: Returns Status
 *      nickname: federations
 *      consumes:
 *        - text/html
 *      parameters:
 *        - name: id
 *          description: Your federations Id
 *          paramType: path
 *          required: true
 *          dataType: string
 *        - name: body
 *          description: Your federations Information
 *          paramType: body
 *          required: true
 *          dataType: string
 *            
 */
router.put(settings.federations + "/:id", function(req, res) {

    federationcontroller.updateFederation(req, function(err, data) {
        console.log(err);
        if (err) {
           res.status(err.code).json({"Error(s)": err.error});
        } else {
            res.status(200).json();
        }
    });

});


/**
 * @swagger
 * path: /otto/federations/{federationid}/{entityid}
 * operations:
 *   -  httpMethod: Delete
 *      summary: Leave federation
 *      notes: Returns federations status
 *      nickname: LeaveFederation
 *      consumes:
 *        - text/html
 *      parameters:
 *        - name: federationid
 *          description: Your federations Id
 *          paramType: path
 *          required: true
 *          dataType: string
 *        - name: entityid
 *          description: Your Entity Id
 *          paramType: path
 *          required: true
 *          dataType: string
 */
router.delete(settings.federations + '/:fid/:eid' , function(req, res) {
  federationcontroller.leaveFederation(req,function(err,callback){
                   if (err) {
                      res.status(err.code).json({"Error(s)": err.error});
                   }
                   res.status(200).json(); 
            });
    

});

/**
 * @swagger
 * path: /otto/federations/{federationid}/{entityid}
 * operations:
 *   -  httpMethod: post
 *      summary: Join federation (Existing Entity)
 *      notes: Returns federations status
 *      nickname: JoinFederation
 *      consumes:
 *        - text/html
 *      parameters:
 *        - name: federationid
 *          description: Your federations Id
 *          paramType: path
 *          required: true
 *          dataType: string
 *        - name: entityid
 *          description: Your Entity Id
 *          paramType: path
 *          required: true
 *          dataType: string
 */
router.post(settings.federations + '/:fid/:eid' , function(req, res) {

       federationcontroller.joinFederation(req,function(err,callback){
                   if (err) {
                        res.status(err.code).json({"Error(s)": err.error});
                   }
                   res.status(200).json(); 
            });

});


/**
 * @swagger
 * path: /otto/federations/{federationid}
 * operations:
 *   -  httpMethod: POST
 *      summary: Join federation (Create New Entity)
 *      notes: Returns federations status
 *      nickname: JoinFederation
 *      consumes:
 *        - text/html
 *      parameters:
 *        - name: federationid
 *          description: Your federations Id
 *          paramType: path
 *          required: true
 *          dataType: string
 *        - name: entitydata
 *          description: Entity Data
 *          paramType: body
 *          required: true
 *          dataType: string  
 */
router.post(settings.federations + '/:fid/' , function(req, res) {

    federationentitycontroller.addFederationEntity(req, function(err, data) {
        console.log(err);
        if (err) {
           res.status(err.code).json({"Error(s)": err.error});
        } else {
            req.params.eid =data.toString();
            federationcontroller.joinFederation(req,function(err,callback){
                   if (err) {
                    res.status(409).json({
                        "Error(s)": err
                        }); 
                   }
                   res.status(200).json(); 
            });
        }
    });

});

module.exports = router;