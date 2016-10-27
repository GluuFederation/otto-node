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
        "organizations_endpoint": baseURL + settings.organization
       
    };

    res.status(200).json(discoveryList);

});

/**
 * @swagger
 * path: /otto/jwks
 * operations:
 *   -  httpMethod: GET
 *      summary: JWK Endpoint
 *      notes: Endpoint to return jwk
 *      nickname: JWKEndpointAPI
 */
router.get("/otto/jwks", function(req, res) {
    var jwks ={ "keys" : [{
      "kid": "abff2bf5-ba52-4e1c-a3bb-549c3e7ff6b1",
        "kty": "RSA",
        "use": "sig",
        "alg": "RS256",
       
        "n": "ALDXCGMSPRpsu0dalvJEMEQpdGPeLeTpfV4LGuonZnK0Q1yO+VXhaKdw4jhxg8Y4frpRz1YK+yA8uUCVCkzCkUqnNO4g3jk21V1PhVeYCrGemg+y65NIWWe6hwieNNI523BRHblBckeP+hd2Q8fmoy9diwQWnnBE8lFYFSoIYe6k3rhU14dbxOGOIf+PhHTzela0OjniqbKKi1zDBJZhKfmBl+zfjaCRau2GEVD6j7EQBrUgtzqQwlK5f8hwXkve6rcOfx8O0Xu6a5wRbvMeMtgeuhGQJ1vtwxV3hXWf/d3xyGtkg8R/ptkUp9M/iZkKENzx1AjL2EnpvFDIzJiH/58=",
        "e": "AQAB"
    }]};
    
res.status(200).json(jwks);
});




module.exports = router;
