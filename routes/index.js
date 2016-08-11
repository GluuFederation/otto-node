var express = require('express');
var router = express.Router();
var settings = require("../settings");
var baseURL = settings.baseURL;
var organizationController = require("../controller/organizationController");
/**
 * @swagger
 * resourcePath: /OTTO
 * description: Open Trust Taxonomy for Federation Operators
 */
router.get('/', function(req, res) {
    var result = {
        "status": "200",
        "api": "Open Trust Taxonomy for Federation Operators"
    };
    res.status(200).json(result);
});

/**
 * @swagger
 * path: /.well-known/otto-configuration
 * operations:
 *   -  httpMethod: GET
 *      summary: Discovery Endpoint
 *      notes: Endpoint to return discovery metadata that are hosted by given server.
 *      nickname: DiscoveryEndpointAPI
 */
router.get(settings.discoveryEndpoint, function(req, res) {
    var discoveryList = {
        "issuer": "issuer",
        "federations_endpoint": baseURL + settings.federations,
        "federation_entity_endpoint": baseURL + settings.entity,
        "organizations_endpoint": baseURL + settings.organization,
        "schema_endpoint": baseURL + settings.schema,
    };
    res.status(200).json(discoveryList);
});


/**
 * @swagger
 * path: /otto/federations
 * operations:
 *   -  httpMethod: GET
 *      summary: Federations Endpoint
 *      notes: Endpoint to return federation metadata or federation IDs that are hosted by given server.
 *      nickname: FederationsEndpointAPI
 */
router.get(settings.federations, function(req, res) {
    var result = {
        "status": "200",
        "api": baseURL + settings.federations,
    };
    res.status(200).json(result);
});

/**
 * @swagger
 * path: /otto/entity
 * operations:
 *   -  httpMethod: GET
 *      summary: Federation_Entity Endpoint
 *      notes:  Endpoint to return federation_entity metadata  that are hosted by given server.
 *      nickname: Federation_EntityAPI
 */
router.get(settings.entity, function(req, res) {
    var result = {
        "status": "200",
        "api": baseURL + settings.entity,
    };
    res.status(200).json(result);
});

/**
 * @swagger
 * path: /otto/organization
 * operations:
 *   -  httpMethod: GET
 *      summary: Organization Endpoint
 *      notes: Endpoint to return organization metadata  that are hosted by given server.
 *      nickname: OrganizationEndpointAPI
 */
router.get(settings.organization, function(req, res) {
    organizationController.getAllOrganization(function(err, data) {
        if (err) {
            var result = {
                status: '0',
                msg: 'There was an error reporting your issue.'
            };
            res.status(500).json(result);
        } else {

            var jsonArray = [];

            for (var i = 0; i < data.length; i++) {
              jsonArray.push(data[i].id);
            }

            res.status(200).json({
                //"@context": settings.contextSchema + settings.contextOrganization,
              //  "@type": settings.contextOrganization,
                "organizations" : jsonArray
            });
        }
    });
});

/**
 * @swagger
 * path: /otto/schema
 * operations:
 *   -  httpMethod: GET
 *      summary: Schema Endpoint
 *      notes: Endpoint to return schema metadata  that are hosted by given server.
 *      nickname: SchemaEndpointAPI
 */
router.get(settings.schema, function(req, res) {
    var result = {
        "status": "200",
        "api": baseURL + settings.schema,
    };
    res.status(200).json(result);
});
module.exports = router;
