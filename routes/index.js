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
        "issuer": baseURL,
        "federations_endpoint": baseURL + settings.federations,
        "federation_entity_endpoint": baseURL + settings.federation_entity,
        "organizations_endpoint": baseURL + settings.organization,
       "federation_signing_alg_values_supported" : [
        "RS256",
        "RS384",
        "RS512"
       
       ]
    };

    res.status(200).json(discoveryList);

});

module.exports = router;
