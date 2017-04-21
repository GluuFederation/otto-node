// File : routes/requirement.js -->
var express = require('express');
var router = express.Router();

var requirementController = require('../controller/racontroller');
var settings = require('../settings');

var registrationAuthorityURL = settings.registrationAuthority;

router.get(registrationAuthorityURL + '/:id', function (req, res) {
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

module.exports = router;