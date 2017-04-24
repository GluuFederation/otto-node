// File : routes/badge.js -->
var express = require('express');
var router = express.Router();

var badgeController = require('../controller/badgecontroller');
var settings = require('../settings');

var baseURL = settings.baseURL;
var badgeURL = settings.badge;

/**
 * @swagger
 * resourcePath: /Badge
 * description: Open Trust Taxonomy for Federation Operators
 */

/**
 * @swagger
 * path: /otto/badge
 * operations:
 *   -  httpMethod: POST
 *      summary: Create Badge
 *      notes: Returns created Badge Id
 *      nickname: Badge
 *      consumes:
 *        - text/html
 *      parameters:
 *        - name: Badge Json
 *          description: Your Badge JSON
 *          paramType: body
 *          required: true
 *          dataType: string
 */
router.post(badgeURL, function (req, res) {
  try {
    badgeController.addBadge(req, function (err, data) {
      console.log(err);
      if (err) {
        res.status(err.code).json({'Error(s)': err.error});
      } else {
        res.status(201).json({
          '@id': baseURL + badgeURL + '/' + data
        });
      }
    });
  } catch (e) {
    res.status(500).json();
  }
});

/**
 * @swagger
 * path: /otto/badge/{id}
 * operations:
 *   -  httpMethod: GET
 *      summary: Get Badge By Id
 *      notes: Returns Badge
 *      nickname: GetBadgeById
 *      parameters:
 *        - name: id
 *          paramType: path
 *          description: Your Badge Id
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
router.get(badgeURL + '/:id', function (req, res) {
  try {
    badgeController.findBadge(req, function (err, data) {
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
 * path: /otto/badge
 * operations:
 *   -  httpMethod: GET
 *      summary: Get Badge
 *      notes: Returns Badge
 *      nickname: GetBadge
 *      parameters:
 *       - name: depth
 *         description: depth[badge, badge.supportedBy]
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
router.get(badgeURL, function (req, res) {
  try {
    badgeController.getAllBadgeWithDepth(req, function (err, data) {
      if (err) {
        res.status(err.code).json({'Error(s)': err.error});
      } else {
        res.status(200).json({
          badge: data
        });
      }
    });
  } catch (e) {
    res.status(500).json();
  }
});

/**
 * @swagger
 * path: /otto/badge/{id}
 * operations:
 *   -  httpMethod: Delete
 *      summary: Delete Badge
 *      notes: Returns Badge status
 *      nickname: DeleteBadge
 *      consumes:
 *        - text/html
 *      parameters:
 *        - name: id
 *          description: Your Badge Id
 *          paramType: path
 *          required: true
 *          dataType: string
 */
router.delete(badgeURL + '/:id', function (req, res) {
  try {
    badgeController.deleteBadge(req, function (err) {
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
 * path: /otto/badge/{id}
 * operations:
 *   -  httpMethod: PUT
 *      summary: Update Badge
 *      notes: Returns Status
 *      nickname: PutBadge
 *      consumes:
 *        - text/html
 *      parameters:
 *        - name: id
 *          description: Your Badge Id
 *          paramType: path
 *          required: true
 *          dataType: string
 *        - name: body
 *          description: Your Badge Information
 *          paramType: body
 *          required: true
 *          dataType: string
 *
 */
router.put(badgeURL + '/:id', function (req, res) {
  try {
    badgeController.updateBadge(req, function (err, data) {
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
 * path: /otto/badge/{bid}/issuer/{pid}
 * operations:
 *   -  httpMethod: post
 *      summary: Issue badge
 *      notes: Badge issue by participant
 *      nickname: IssueBadge
 *      consumes:
 *        - text/html
 *      parameters:
 *        - name: bid
 *          description: Your Badge Id
 *          paramType: path
 *          required: true
 *          dataType: string
 *        - name: pid
 *          description: Your participant Id
 *          paramType: path
 *          required: true
 *          dataType: string
 */
router.post(badgeURL + '/:bid/issuer/:pid', function (req, res) {
  try {
    badgeController.issueBadge(req, function (err, callback) {
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