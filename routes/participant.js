// File : routes/participant.js -->
var express = require('express');
var router = express.Router();
var settings = require("../settings");
var baseURL = settings.baseURL;
var participantURL = settings.participant;
var participantController = require("../controller/participantcontroller");
/**
 * @swagger
 * resourcePath: /Participant
 * description: Open Trust Taxonomy for Federation Operators
 */

/**
 * @swagger
 * path: /otto/participant
 * operations:
 *   -  httpMethod: POST
 *      summary: Create participant
 *      notes: Returns created participant Id
 *      nickname: Participant
 *      consumes:
 *        - text/html
 *      parameters:
 *        - name: Participant JSON
 *          description: Your participant JSON
 *          paramType: body
 *          required: true
 *          dataType: string
 */
router.post(participantURL, function (req, res) {
  try {
    participantController.addParticipant(req, function (err, data) {
      console.log(err);
      if (err) {
        res.status(err.code).json({"Error(s)": err.error});
      } else {
        res.status(200).json({
          '@id': baseURL + participantURL + '/' + data
        });
      }
    });
  } catch (e) {
    res.status(500).json();
  }
});

/**
 * @swagger
 * path: /otto/participant/{id}
 * operations:
 *   -  httpMethod: GET
 *      summary: Get participant  By Id
 *      notes: Returns participant
 *      nickname: GetparticipantById
 *      parameters:
 *        - name: id
 *          paramType: path
 *          description: Your participant  Id
 *          required: true
 *          dataType: string
 *        - name: depth
 *          description: depth
 *          paramType: query
 *          required: false
 *          dataType: string
 *        - name: filter
 *          description: jspath filter syntax
 *          paramType: query
 *          required: false
 *          dataType: string
 */
router.get(participantURL + '/:id', function (req, res) {

  try {
    participantController.findParticipant(req, function (err, data) {
      if (err) {
        res.status(err.code).json({"Error(s)": err.error});
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
 * path: /otto/participant
 * operations:
 *   -  httpMethod: GET
 *      summary: Get Participant
 *      notes: Returns Participant
 *      nickname: GetParticipant
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
router.get(participantURL, function (req, res) {
  try {
    participantController.getAllParticipantWithDepth(req, function (err, data) {
      if (err) {
        res.status(err.code).json({"Error(s)": err.error});
      } else {
        res.status(200).json({
          participant: data
        });
      }
    });
  } catch (e) {
    res.status(500).json();
  }
});


/**
 * @swagger
 * path: /otto/participant/{id}
 * operations:
 *   -  httpMethod: Delete
 *      summary: Delete participant
 *      notes: Returns participant  status
 *      nickname: Deleteparticipant
 *      consumes:
 *        - text/html
 *      parameters:
 *        - name: id
 *          description: Your participant Id
 *          paramType: path
 *          required: true
 *          dataType: string
 *
 *
 */
router.delete(participantURL + '/:id', function (req, res) {
  try {
    participantController.deleteParticipant(req, function (err) {
      if (err) {
        res.status(err.code).json({"Error(s)": err.error});
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
 * path: /otto/participant/{id}
 * operations:
 *   -  httpMethod: PUT
 *      summary: Update participant
 *      notes: Returns Status
 *      nickname: Putparticipant
 *      consumes:
 *        - text/html
 *      parameters:
 *        - name: id
 *          description: Your participant  Id
 *          paramType: path
 *          required: true
 *          dataType: string
 *        - name: body
 *          description: Your participant Information
 *          paramType: body
 *          required: true
 *          dataType: string
 *
 */
router.put(participantURL + "/:id", function (req, res) {
  try {
    participantController.updateParticipant(req, function (err, data) {
      console.log(err);
      if (err) {
        res.status(err.code).json({"Error(s)": err.error});
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
 * path: /otto/participant/{oid}/federation/{fid}
 * operations:
 *   -  httpMethod: POST
 *      summary: Add Federation to Participant
 *      notes: Returns Status
 *      nickname: AddFederationToParticipant
 *      consumes:
 *        - text/html
 *      parameters:
 *        - name: oid
 *          description: Your Participant  Id
 *          paramType: path
 *          required: true
 *          dataType: string
 *        - name: fid
 *          description: Your Federation  Id
 *          paramType: path
 *          required: true
 *          dataType: string
 *
 */
router.post(participantURL + "/:oid/federation/:fid", function (req, res) {
  try {
    participantController.joinFederationParticipant(req, function (err, docs) {
      if (err)
        res.status(err.code).json({"Error(s)": err.error});
      res.status(200).json();
    });
  } catch (e) {
    res.status(500).json();
  }
});

/**
 * @swagger
 * path: /otto/participant/{oid}/entity/{eid}
 * operations:
 *   -  httpMethod: POST
 *      summary: Add Entity to Participant
 *      notes: Returns Status
 *      nickname: AddEntityToParticipant
 *      consumes:
 *        - text/html
 *      parameters:
 *        - name: oid
 *          description: Your Participant Id
 *          paramType: path
 *          required: true
 *          dataType: string
 *        - name: eid
 *          description: Your Entity  Id
 *          paramType: path
 *          required: true
 *          dataType: string
 *
 */
router.post(participantURL + "/:oid/entity/:eid", function (req, res) {
  try {
    participantController.joinEntityParticipant(req, function (err, docs) {
      if (err) {
        res.status(err.code).json({"Error(s)": err.error});
      }
      res.status(200).json();
    });
  } catch (e) {
    res.status(500).json();
  }
});

module.exports = router;