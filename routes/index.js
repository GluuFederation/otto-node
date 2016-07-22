var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
      res.writeHead(200, {
  			'Content-Type': 'text/plain'
  		});
  		res.end('Home : 200');
});

router.get('/.well-known/openid-configuration', function (req, res) {
  res.render('index.ejs', { title: "Home", host: req.get('host') });
});


router.get('/federations', function (req, res) {
      res.writeHead(200, {
  			'Content-Type': 'text/plain'
  		});
  		res.end('federations : 200');
});

router.get('/federation_entity', function (req, res) {
      res.writeHead(200, {
  			'Content-Type': 'text/plain'
  		});
  		res.end('federation_entity : 200');
});

router.get('/org', function (req, res) {
      res.writeHead(200, {
  			'Content-Type': 'text/plain'
  		});
  		res.end('org : 200');
});

router.get('/schema', function (req, res) {
      res.writeHead(200, {
  			'Content-Type': 'text/plain'
  		});
  		res.end('schema : 200');
});


module.exports = router;
