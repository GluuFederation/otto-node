// File : routes/acr.js -->
var express = require('express');
var router = express.Router();

var acrController = require('../controller/acrcontroller');
var settings = require('../settings');

var baseURL = settings.baseURL;
var acrURL = settings.acr;

/**
 * @swagger
 * resourcePath: /ACR
 * description: Open Trust Taxonomy for Federation Operators
 */

/**
 * @swagger
 * path: /otto/acr
 * operations:
 *   -  httpMethod: POST
 *      summary: Create ACR
 *      notes: Returns created ACR Id
 *      nickname: ACR
 *      consumes:
 *        - text/html
 *      parameters:
 *        - name: ACR Json
 *          description: Your ACR JSON
 *          paramType: body
 *          required: true
 *          dataType: string
 */
router.post(acrURL, function (req, res) {
  try {
    acrController.addACR(req, function (err, data) {
      console.log(err);
      if (err) {
        res.status(err.code).json({'Error(s)': err.error});
      } else {
        res.status(201).json({
          '@id': baseURL + acrURL + '/' + data
        });
      }
    });
  } catch (e) {
    res.status(500).json();
  }
});

/**
 * @swagger
 * path: /otto/acr/{id}
 * operations:
 *   -  httpMethod: GET
 *      summary: Get ACR By Id
 *      notes: Returns ACR
 *      nickname: GetACRById
 *      parameters:
 *        - name: id
 *          paramType: path
 *          description: Your ACR Id
 *          required: true
 *          dataType: string
 *        - name: depth
 *          description: depth[metadata, federatedBy]
 *          paramType: query
 *          required: false
 *          dataType: string
 *        - name: filter
 *          description: jspath filter syntax
 *          paramType: query
 *          required: false
 *          dataType: string
 *
 */
router.get(acrURL + '/:id', function (req, res) {
  try {
    acrController.findACR(req, function (err, data) {
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
 * path: /otto/acr
 * operations:
 *   -  httpMethod: GET
 *      summary: Get ACR
 *      notes: Returns ACR
 *      nickname: GetACR
 *      parameters:
 *       - name: depth
 *         description: depth[acr, acr.supportedBy]
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
router.get(acrURL, function (req, res) {
  try {
    acrController.getAllACRWithDepth(req, function (err, data) {
      if (err) {
        res.status(err.code).json({'Error(s)': err.error});
      } else {
        res.status(200).json({
          acr: data
        });
      }
    });
  } catch (e) {
    res.status(500).json();
  }
});

/**
 * @swagger
 * path: /otto/acr/{id}
 * operations:
 *   -  httpMethod: Delete
 *      summary: Delete ACR
 *      notes: Returns ACR status
 *      nickname: DeleteACR
 *      consumes:
 *        - text/html
 *      parameters:
 *        - name: id
 *          description: Your ACR Id
 *          paramType: path
 *          required: true
 *          dataType: string
 */
router.delete(acrURL + '/:id', function (req, res) {
  try {
    acrController.deleteACR(req, function (err) {
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
 * path: /otto/acr/{id}
 * operations:
 *   -  httpMethod: PUT
 *      summary: Update ACR
 *      notes: Returns Status
 *      nickname: PutACR
 *      consumes:
 *        - text/html
 *      parameters:
 *        - name: id
 *          description: Your ACR Id
 *          paramType: path
 *          required: true
 *          dataType: string
 *        - name: body
 *          description: Your ACR Information
 *          paramType: body
 *          required: true
 *          dataType: string
 *
 */
router.put(acrURL + '/:id', function (req, res) {
  try {
    acrController.updateACR(req, function (err, data) {
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
 * path: /otto/acr/{eid}/federation/{fid}
 * operations:
 *   -  httpMethod: post
 *      summary: Join acr (Existing federation)
 *      notes: The federation to which this acr is affiliated
 *      nickname: JoinFederation
 *      consumes:
 *        - text/html
 *      parameters:
 *        - name: eid
 *          description: Your ACR Id
 *          paramType: path
 *          required: true
 *          dataType: string
 *        - name: fid
 *          description: Your Federation Id
 *          paramType: path
 *          required: true
 *          dataType: string
 */
router.post(acrURL + '/:eid/federation/:fid', function (req, res) {
  try {
    acrController.joinACR(req, function (err, callback) {
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