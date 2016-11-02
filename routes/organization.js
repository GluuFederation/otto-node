// File : routes/organization.js -->
var express = require('express');
var router = express.Router();
var settings = require("../settings");
var baseURL = settings.baseURL;
var organizationURL = settings.organization;
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
 *        - name: Organization JSON
 *          description: Your organization  JSON
 *          paramType: body
 *          required: true
 *          dataType: string
 */
router.post(organizationURL, function(req, res) {

    try{
    organizationcontroller.addOrganization(req, function(err, data) {
        console.log(err);
        if (err) {
           res.status(err.code).json({"Error(s)": err.error});
        } else {
            res.status(200).json({
                "@id": baseURL + organizationURL + "/" + data
            });
        }
    });
    }catch(e){
        res.status(500).json();
    }
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
 *        - name: depth
 *          description: depth
 *          paramType: query
 *          required: false
 *          dataType: string
 *        - name: filter
 *          description: jspath filter syntax
 *          paramType: query
 *          required: false
 *          dataType: string
 */
router.get(organizationURL + '/:id', function(req, res) {

    try{
    organizationcontroller.findOrganization(req, function(err, data) {
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
 * path: /otto/organization
 * operations:
 *   -  httpMethod: GET
 *      summary: Get Organization 
 *      notes: Returns Organization 
 *      nickname: GetOrganization
 *      parameters:
 *        - name: depth
 *          description: depth
 *          paramType: query
 *          required: false
 *          dataType: string
 *        - name: pageno
 *          description: page no (Starts from 0)
 *          paramType: query
 *          required: false
 *          dataType: string
 *        - name: pagelength
 *          description: page length
 *          paramType: query
 *          required: false
 *          dataType: string
 *
 */
router.get(organizationURL, function(req, res) {
    try{
    organizationcontroller.getAllOrganizationWithDepth(req, function(err, data) {
        if (err) {
           res.status(err.code).json({"Error(s)": err.error});
        } else {
            res.status(200).json({
                organization: data
            });
        }
    });
    }catch(e){
        res.status(500).json();
    }
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
 * 
 * 
 */
router.delete(organizationURL + '/:id', function(req, res) {

    try{
    organizationcontroller.deleteOrganization(req, function(err) {
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
router.put(organizationURL + "/:id", function(req, res) {
    try{
    organizationcontroller.updateOrganizattion(req, function(err, data) {
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

/**
 * @swagger
 * path: /otto/organization/{oid}/federation/{fid}
 * operations:
 *   -  httpMethod: POST
 *      summary: Add Federation to Organization
 *      notes: Returns Status
 *      nickname: AddFederationToOrganization
 *      consumes:
 *        - text/html
 *      parameters:
 *        - name: oid
 *          description: Your Organization  Id
 *          paramType: path
 *          required: true
 *          dataType: string
 *        - name: fid
 *          description: Your Federation  Id
 *          paramType: path
 *          required: true
 *          dataType: string
 *            
 */
router.post(organizationURL + "/:oid/federation/:fid", function(req, res) {
try{
    organizationcontroller.joinFederationOrganization(req,function(err,docs){
         if (err) 
            res.status(err.code).json({"Error(s)": err.error});
         res.status(200).json(); 
    });
}catch(e){
        res.status(500).json();
    }
});

/**
 * @swagger
 * path: /otto/organization/{oid}/federation_entity/{eid}
 * operations:
 *   -  httpMethod: POST
 *      summary: Add Entity to Organization
 *      notes: Returns Status
 *      nickname: AddEntityToOrganization
 *      consumes:
 *        - text/html
 *      parameters:
 *        - name: oid
 *          description: Your Organization Id
 *          paramType: path
 *          required: true
 *          dataType: string
 *        - name: eid
 *          description: Your Entity  Id
 *          paramType: path
 *          required: true
 *          dataType: string
 *            
 */
router.post(organizationURL + "/:oid/federation_entity/:eid", function(req, res) {
try{
    organizationcontroller.joinEntityOrganization(req,function(err,docs){
         if (err) {
             res.status(err.code).json({"Error(s)": err.error});
         }
         res.status(200).json(); 
    });
    }catch(e){
        res.status(500).json();
    }
});

module.exports = router;