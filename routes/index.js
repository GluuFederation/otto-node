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
 res.render('index.ejs', { title: "Home", host: req.get('host') });
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
      res.writeHead(200, {
  			'Content-Type': 'text/plain'
  		});
  		res.end('Federations Endpoint : 200');
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
      res.writeHead(200, {
  			'Content-Type': 'text/plain'
  		});
  		res.end('Federation_Entity Endpoint : 200');
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
      res.writeHead(200, {
  			'Content-Type': 'text/plain'
  		});
  		res.end('Organization Endpoint : 200');
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
      res.writeHead(200, {
  			'Content-Type': 'text/plain'
  		});
  		res.end('Schema Endpoint : 200');

});
module.exports = router;
