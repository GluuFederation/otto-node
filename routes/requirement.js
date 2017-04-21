// File : routes/requirement.js -->
var express = require('express');
var router = express.Router();

var requirementController = require('../controller/requirementcontroller');
var settings = require('../settings');

var baseURL = settings.baseURL;
var requirementURL = settings.requirement;

/**
 * @swagger
 * resourcePath: /Requirement
 * description: Open Trust Taxonomy for Federation Operators
 */

/**
 * @swagger
 * path: /otto/requirement
 * operations:
 *   -  httpMethod: POST
 *      summary: Create Requirement
 *      notes: Returns created Requirement Id
 *      nickname: Requirement
 *      consumes:
 *        - text/html
 *      parameters:
 *        - name: Requirement Json
 *          description: Your Requirement JSON
 *          paramType: body
 *          required: true
 *          dataType: string
 */
router.post(requirementURL, function (req, res) {
  try {
    requirementController.addRequirement(req, function (err, data) {
      console.log(err);
      if (err) {
        res.status(err.code).json({'Error(s)': err.error});
      } else {
        res.status(201).json({
          '@id': baseURL + requirementURL + '/' + data
        });
      }
    });
  } catch (e) {
    res.status(500).json();
  }
});

/**
 * @swagger
 * path: /otto/requirement/{id}
 * operations:
 *   -  httpMethod: GET
 *      summary: Get Requirement By Id
 *      notes: Returns Requirement
 *      nickname: GetRequirementById
 *      parameters:
 *        - name: id
 *          paramType: path
 *          description: Your Requirement Id
 *          required: true
 *          dataType: string
 *        - name: filter
 *          description: jspath filter syntax
 *          paramType: query
 *          required: false
 *          dataType: string
 *
 */
router.get(requirementURL + '/:id', function (req, res) {
  try {
    requirementController.findRequirement(req, function (err, data) {
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
 * path: /otto/requirement
 * operations:
 *   -  httpMethod: GET
 *      summary: Get Requirement
 *      notes: Returns Requirement
 *      nickname: GetRequirement
 *      parameters:
 *       - name: depth
 *         description: depth[requirement]
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
router.get(requirementURL, function (req, res) {
  try {
    requirementController.getAllRequirementWithDepth(req, function (err, data) {
      if (err) {

        res.status(err.code).json({'Error(s)': err.error});
      } else {
        res.status(200).json({
          requirement: data
        });
      }
    });
  } catch (e) {
    res.status(500).json();
  }
});

/**
 * @swagger
 * path: /otto/requirement/{id}
 * operations:
 *   -  httpMethod: Delete
 *      summary: Delete Requirement
 *      notes: Returns Requirement status
 *      nickname: DeleteRequirement
 *      consumes:
 *        - text/html
 *      parameters:
 *        - name: id
 *          description: Your Requirement Id
 *          paramType: path
 *          required: true
 *          dataType: string
 */
router.delete(requirementURL + '/:id', function (req, res) {
  try {
    requirementController.deleteRequirement(req, function (err) {
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
 * swagger
 * path: /otto/requirement/{id}
 * operations:
 *   -  httpMethod: PUT
 *      summary: Update Requirement
 *      notes: Returns Status
 *      nickname: PutRequirement
 *      consumes:
 *        - text/html
 *      parameters:
 *        - name: id
 *          description: Your Requirement Id
 *          paramType: path
 *          required: true
 *          dataType: string
 *        - name: body
 *          description: Your Requirement Information
 *          paramType: body
 *          required: true
 *          dataType: string
 *
 */
router.put(requirementURL + '/:id', function (req, res) {
  try {
    requirementController.updateRequirement(req, function (err, data) {
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

module.exports = router;