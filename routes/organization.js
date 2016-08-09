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
router.post(settings.organization, function(req, res) {
    var organizationName = req.param('name');
    if (organizationName == "" || organizationName == undefined) {
        var result = {
            status: '0',
            msg: 'Organization name is required.'
        };
        res.status(200).json(result);
        return;
    }

    organizationController.createOrganization(organizationName, function(err, data) {
        if (err) {
            var result = {
                status: '0',
                msg: 'There was an error reporting your issue.'
            };
            res.status(500).json(result);
            return;
        } else {
            var result = {
                "id": baseURL + organizationEndPointPath + "/" + data[1][0].organizationId
            };
            res.status(200).json(result);
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
router.get(settings.organization +'/:id', function(req, res) {
    var organizationId = req.params.id;
    if (organizationId == "" || organizationId == undefined) {
        var result = {
            status: '0',
            msg: 'Organization id is required.'
        };
        res.status(200).json(result);
        return;
    }

    organizationController.getOrganizationById(organizationId, function(err, data) {
        if (err) {
            var result = {
                status: '0',
                msg: err
            };
            res.status(500).json(result);
            return;
        } else {
            if (data.length > 0) {
                var result = {
                    '@context': settings.contextSchema,
                    '@type': settings.contextOrganization,
                    '@id': data[0]['@id'],
                    'name': data[0].organizationName
                };
                res.status(200).json(result);
            } else {
                var result = {
                    status: '400',
                    msg: 'Organization is not found.'
                };
                res.status(400).json(result);
            }
        }
    });
});
module.exports = router;
