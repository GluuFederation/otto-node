// File : routes/federations.js -->
var express = require('express');
var router = express.Router();
var settings = require('../settings');
var baseURL = settings.baseURL;
var federationURL = settings.federations;
var federationController = require('../controller/federationcontroller');
var entityController = require('../controller/entitycontroller');
var jws = require('jws');
var fs = require('fs');
var keypair = require('keypair');
var pem2jwk = require('pem-jwk').pem2jwk;
var algArr = ['RS256', 'RS384', 'RS512'];

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
 *        - name: Federation JSON
 *          description: Your Federation JSON
 *          paramType: body
 *          required: true
 *          dataType: string
 */
router.post(settings.federations, function (req, res) {
  federationController.addFederation(req, function (err, data) {
    console.log(err);
    if (err) {
      res.status(err.code).json({
        'Error(s)': err.error
      });
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
 *          description: depth
 *          paramType: query
 *          required: false
 *          dataType: string
 *        - name: filter
 *          description: jspath filter syntax (Example- .name)
 *          paramType: query
 *          required: false
 *          dataType: string
 *
 */
router.get(settings.federations + '/:id', function (req, res) {
  federationController.findFederation(req, function (err, data) {
    if (err) {
      res.status(err.code).json({
        'Error(s)': err.error
      });
    } else {
      res.status(200).json(data)
    }
  });
});

/**
 *
 * path: /otto/federations/{id}/jwks
 * operations:
 *   -  httpMethod: GET
 *      summary: Get Federation jwks
 *      notes: Returns Federations jwks
 *      nickname: GetFederationsJWKs
 *      parameters:
 *        - name: id
 *          paramType: path
 *          description: Your Federation Id
 *          required: true
 *          dataType: string
 */
router.get(settings.federations + '/:id/jwks', function (req, res) {
  federationController.getJWKsForFederation(req, function (err, data) {
    if (err) {
      res.status(err.code).json({
        'Error(s)': err.error
      });
    } else {
      res.status(200).json(data);
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
router.get(settings.federations, function (req, res) {
  try {
    federationController.getAllFederationWithDepth(req, function (err, data) {
      if (err) {
        res.status(err.code).json({
          'Error(s)': err.error
        });
      } else {
        res.status(200).json({
          '@context': baseURL + settings.federations,
          federations: data
        });
      }
    });
  } catch (e) {
    res.status(500).json();
  }
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
router.delete(settings.federations + '/:id', function (req, res) {
  try {
    federationController.deleteFederation(req, function (err) {
      if (err) {
        res.status(err.code).json({
          'Error(s)': err.error
        });
      } else {
        res.status(200).json();
      }
    });
  } catch (e) {
    res.status(500).json();
  }
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
router.put(settings.federations + "/:id", function (req, res) {
  try {
    federationController.updateFederation(req, function (err, data) {
      console.log(err);
      if (err) {
        res.status(err.code).json({
          'Error(s)': err.error
        });
      } else {
        res.status(200).json();
      }
    });
  } catch (e) {
    res.status(500).json();
  }
});

/**
 * @swagger
 * path: /otto/federations/{fid}/entity/{eid}
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
router.delete(settings.federations + '/:fid/entity/:eid', function (req, res) {
  try {
    federationController.leaveFederation(req, function (err, callback) {
      if (err) {
        res.status(err.code).json({
          'Error(s)': err.error
        });
      }
      res.status(200).json();
    });
  } catch (e) {
    res.status(500).json();
  }
});

/**
 * @swagger
 * path: /otto/federations/{fid}/entity/{eid}
 * operations:
 *   -  httpMethod: post
 *      summary: Link entity to the federation
 *      notes: Services registered to the federation i:e federation.federates
 *      nickname: JoinFederation
 *      consumes:
 *        - text/html
 *      parameters:
 *        - name: fid
 *          description: Your federations Id
 *          paramType: path
 *          required: true
 *          dataType: string
 *        - name: eid
 *          description: Your Entity Id
 *          paramType: path
 *          required: true
 *          dataType: string
 */
router.post(settings.federations + '/:fid/entity/:eid', function (req, res) {
  try {
    federationController.joinFederation(req, function (err, callback) {
      if (err) {
        res.status(err.code).json({
          'Error(s)': err.error
        });
      }
      res.status(200).json();
    });
  } catch (e) {
    res.status(500).json();
  }
});

/**
 * @swagger
 * path: /otto/federations/{fid}
 * operations:
 *   -  httpMethod: POST
 *      summary: Add new service
 *      notes: Returns federations status
 *      nickname: JoinFederation
 *      consumes:
 *        - text/html
 *      parameters:
 *        - name: fid
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
router.post(settings.federations + '/:fid/', function (req, res) {
  try {
    entityController.addEntity(req, function (err, data) {
      console.log(err);
      if (err) {
        res.status(err.code).json({
          'Error(s)': err.error
        });
      } else {
        req.params.eid = data.toString();
        federationController.joinFederation(req, function (err, callback) {
          if (err) {
            res.status(409).json({
              'Error(s)': err
            });
          }
          res.status(200).json();
        });
      }
    });
  } catch (e) {
    res.status(500).json();
  }

});

/**
 * @swagger
 * path: /otto/federations/{fid}/participant/{pid}
 * operations:
 *   -  httpMethod: POST
 *      summary: Link Participant as a member in Federation
 *      notes: List of organizational members of the Federation
 *      nickname: AddParticipant
 *      consumes:
 *        - text/html
 *      parameters:
 *        - name: fid
 *          description: Your Federation Id
 *          paramType: path
 *          required: true
 *          dataType: string
 *        - name: pid
 *          description: Your Participant Id
 *          paramType: path
 *          required: true
 *          dataType: string
 *
 */
router.post(federationURL + '/:fid/participant/:pid', function (req, res) {
  try {
    federationController.addParticipant(req, function (err, docs) {
      if (err)
        return res.status(err.code).json({'Error(s)': err.error});
      return res.status(200).json();
    });
  } catch (e) {
    res.status(500).json();
  }
});

/**
 * @swagger
 * path: /otto/federations/{fid}/sponsor/{pid}
 * operations:
 *   -  httpMethod: POST
 *      summary: Link Participant as a sponsor to Federation
 *      notes: Organization legally responsible for management of the Federation
 *      nickname: AddParticipant
 *      consumes:
 *        - text/html
 *      parameters:
 *        - name: fid
 *          description: Your Federation Id
 *          paramType: path
 *          required: true
 *          dataType: string
 *        - name: pid
 *          description: Your Participant Id
 *          paramType: path
 *          required: true
 *          dataType: string
 *
 */
router.post(federationURL + '/:fid/sponsor/:pid', function (req, res) {
  try {
    federationController.addSponsor(req, function (err, docs) {
      if (err)
        return res.status(err.code).json({'Error(s)': err.error});
      return res.status(200).json();
    });
  } catch (e) {
    res.status(500).json();
  }
});

/**
 * @swagger
 * path: /otto/federations/{fid}/metadata/{mid}
 * operations:
 *   -  httpMethod: post
 *      summary: Add metadata to the federation
 *      notes: Add metadata to the federation
 *      nickname: AddMetadata
 *      consumes:
 *        - text/html
 *      parameters:
 *        - name: fid
 *          description: Your federations Id
 *          paramType: path
 *          required: true
 *          dataType: string
 *        - name: mid
 *          description: Your Metadata Id
 *          paramType: path
 *          required: true
 *          dataType: string
 */
router.post(settings.federations + '/:fid/metadata/:mid', function (req, res) {
  try {
    federationController.addMetadata(req, function (err, callback) {
      if (err) {
        res.status(err.code).json({
          'Error(s)': err.error
        });
      }
      res.status(200).json();
    });
  } catch (e) {
    res.status(500).json();
  }
});

module.exports = router;