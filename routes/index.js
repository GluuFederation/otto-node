var express = require('express');
var router = express.Router();
var settings = require("../settings");
var baseURL = settings.baseURL;

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
        "@id": baseURL,
        "name": settings.RA_NAME,
        "url": baseURL,
        "description": "OTTO Registration Authority",
        "federation_endpoint": baseURL + settings.federations,
        "participant_endpoint": baseURL + settings.organization,
        "entity_endpoint": baseURL + settings.entity,
        "registers": []
    };

    res.status(200).json(discoveryList);

});

module.exports = router;
