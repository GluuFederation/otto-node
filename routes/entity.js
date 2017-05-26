// File : routes/entity.js -->
var express = require('express');
var router = express.Router();

var entityController = require('../controller/entitycontroller');
var settings = require('../settings');

var baseURL = settings.baseURL;
var entityURL = settings.entity;

/**
 * @swagger
 * resourcePath: /Entity
 * description: Open Trust Taxonomy for Federation Operators
 */

/**
 * @swagger
 * path: /otto/entity
 * operations:
 *   -  httpMethod: POST
 *      summary: Create Entity
 *      notes: Returns created Entity Id
 *      nickname: Entity
 *      consumes:
 *        - text/html
 *      parameters:
 *        - name: Entity Json
 *          description: Your Entity JSON
 *          paramType: body
 *          required: true
 *          dataType: string
 */
router.post(entityURL, function (req, res) {
  try {
    entityController.addEntity(req, function (err, data) {
      console.log(err);
      if (err) {
        res.status(err.code).json({'Error(s)': err.error});
      } else {
        res.status(201).json({
          '@id': baseURL + entityURL + '/' + data
        });
      }
    });
  } catch (e) {
    res.status(500).json();
  }
});

/**
 * @swagger
 * path: /otto/entity/{id}
 * operations:
 *   -  httpMethod: GET
 *      summary: Get Entity By Id
 *      notes: Returns Entity
 *      nickname: GetEntityById
 *      parameters:
 *        - name: id
 *          paramType: path
 *          description: Your Entity Id
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
router.get(entityURL + '/:id', function (req, res) {
  try {
    entityController.findEntity(req, function (err, data) {
      if (err) {
        res.status(err.code).json({'Error(s)': err.error});
      } else {
        res.status(200).json(data);
      }
    });
  } catch (e) {
    res.status(500).json();
  }
});

/**
 * @swagger
 * path: /otto/entity
 * operations:
 *   -  httpMethod: GET
 *      summary: Get Entity
 *      notes: Returns Entity
 *      nickname: GetEntity
 *      parameters:
 *       - name: depth
 *         description: depth
 *         paramType: query
 *         required: false
 *         dataType: string
 *       - name: pageno
 *         description: pageno (Starts from 0)
 *         paramType: query
 *         required: false
 *         dataType: string
 *       - name: pagelength
 *         description: page length
 *         paramType: query
 *         required: false
 *         dataType: string
 *
 *
 */
router.get(entityURL, function (req, res) {
  try {
    entityController.getAllEntityWithDepth(req, function (err, data) {
      if (err) {

        res.status(err.code).json({'Error(s)': err.error});
      } else {
        res.status(200).json({
          '@context': baseURL + settings.entity,
          entity: data
        });
      }
    });
  } catch (e) {
    res.status(500).json();
  }
});

/**
 * @swagger
 * path: /otto/entity/{id}
 * operations:
 *   -  httpMethod: Delete
 *      summary: Delete Entity
 *      notes: Returns Entity status
 *      nickname: DeleteEntity
 *      consumes:
 *        - text/html
 *      parameters:
 *        - name: id
 *          description: Your Entity Id
 *          paramType: path
 *          required: true
 *          dataType: string
 */
router.delete(entityURL + '/:id', function (req, res) {
  try {
    entityController.deleteEntity(req, function (err) {
      if (err) {
        res.status(err.code).json({'Error(s)': err.error});
      } else {
        res.status(200).json();
      }
    });
  }
  catch (e) {
    res.status(500).json();
  }
});


/**
 * @swagger
 * path: /otto/entity/{id}
 * operations:
 *   -  httpMethod: PUT
 *      summary: Update Entity
 *      notes: Returns Status
 *      nickname: PutEntity
 *      consumes:
 *        - text/html
 *      parameters:
 *        - name: id
 *          description: Your Entity Id
 *          paramType: path
 *          required: true
 *          dataType: string
 *        - name: body
 *          description: Your Entity Information
 *          paramType: body
 *          required: true
 *          dataType: string
 *
 */
router.put(entityURL + '/:id', function (req, res) {
  try {
    entityController.updateEntity(req, function (err, data) {
      console.log(err);
      if (err) {
        res.status(err.code).json({'Error(s)': err.error});
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
 * path: /otto/entity/{eid}/federation/{fid}
 * operations:
 *   -  httpMethod: post
 *      summary: Join entity (Existing federation)
 *      notes: The federation to which this entity is affiliated
 *      nickname: JoinFederation
 *      consumes:
 *        - text/html
 *      parameters:
 *        - name: eid
 *          description: Your Entity Id
 *          paramType: path
 *          required: true
 *          dataType: string
 *        - name: fid
 *          description: Your Federation Id
 *          paramType: path
 *          required: true
 *          dataType: string
 */
router.post(entityURL + '/:eid/federation/:fid', function (req, res) {
  try {
    entityController.joinEntity(req, function (err, callback) {
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
 * path: /otto/entity/{eid}/operatedBy/{type}/{id}
 * operations:
 *   -  httpMethod: post
 *      summary: Join entity (Existing federation or entity)
 *      notes: The federation to which this entity is affiliated
 *      nickname: JoinFederation
 *      consumes:
 *        - text/html
 *      parameters:
 *        - name: eid
 *          description: Your Entity Id
 *          paramType: path
 *          required: true
 *          dataType: string
 *        - name: type
 *          description: Your type - federation or entity
 *          paramType: path
 *          required: true
 *          dataType: string
 *          enum:
 *             - "available"
 *             - "pending"
 *             - "sold"
 *        - name: id
 *          description: Your type Id
 *          paramType: path
 *          required: true
 *          dataType: string
 */
router.post(entityURL + '/:eid/operatedBy/:type/:id', function (req, res) {
  try {
    if (req.params.type == "federation") {
      entityController.setFederationAsOperator(req, response);
    } else if (req.params.type == "participant") {
      entityController.setParticipantAsOperator(req, response);
    } else {
      res.status(err.code).json({
        'Error(s)': 'Invalid type'
      });
    }

    function response(err, callback) {
      if (err) {
        res.status(err.code).json({
          'Error(s)': err.error
        });
      }
      res.status(200).json();
    }
  } catch (e) {
    res.status(500).json();
  }
});

module.exports = router;