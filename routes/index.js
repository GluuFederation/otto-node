var express = require('express');
var router = express.Router();


/**
 * @swagger
 * resourcePath: /OTTO
 * description: Open Trust Taxonomy for Federation Operators
 */
router.get('/', function (req, res) {
      res.writeHead(200, {'Content-Type': 'text/plain'});
  		res.end('Open Trust Taxonomy for Federation Operators : 200');
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
router.get('/.well-known/otto-configuration', function (req, res) {
  var discoveryList = {
    "issuer": "issuer",
    "federations_endpoint":  global.baseURL + "/federations",
    "federation_entity_endpoint": global.baseURL + "/federation_entity",
    "organizations_endpoint": global.baseURL + "/org",
    "schema_endpoint":  global.baseURL +"/schema",
  };

 res.json(discoveryList);
});


/**
 * @swagger
 * path: /federations
 * operations:
 *   -  httpMethod: GET
 *      summary: Federations Endpoint
 *      notes: Endpoint to return federation metadata or federation IDs that are hosted by given server.
 *      nickname: FederationsEndpointAPI
 */
router.get('/federations', function (req, res) {
  var result = {
    "Status Code": "200",
    "Api":  global.baseURL + "/federations",
  };
 res.json(result);
});

/**
 * @swagger
 * path: /federation_entity
 * operations:
 *   -  httpMethod: GET
 *      summary: Federation_Entity Endpoint
 *      notes:  Endpoint to return federation_entity metadata  that are hosted by given server.
 *      nickname: Federation_EntityAPI
 */
router.get('/federation_entity', function (req, res) {
  var result = {
    "Status Code": "200",
    "Api":  global.baseURL + "/federation_entity",
  };
 res.json(result);
});

/**
 * @swagger
 * path: /org
 * operations:
 *   -  httpMethod: GET
 *      summary: Organization Endpoint
 *      notes: Endpoint to return organization metadata  that are hosted by given server.
 *      nickname: OrganizationEndpointAPI
 */
router.get('/org', function (req, res) {
  var result = {
    "Status Code": "200",
    "Api":  global.baseURL + "/org",
  };
 res.json(result);
});

/**
 * @swagger
 * path: /schema
 * operations:
 *   -  httpMethod: GET
 *      summary: Schema Endpoint
 *      notes: Endpoint to return schema metadata  that are hosted by given server.
 *      nickname: SchemaEndpointAPI
 */
router.get('/schema', function (req, res) {
  var result = {
    "Status Code": "200",
    "Api":  global.baseURL + "/schema",
  };
 res.json(result);

});
module.exports = router;
