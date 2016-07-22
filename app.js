var http = require("http");
var port = "5053";
var express = require('express');
var router = express.Router();
var path = require('path');

var routes = require('./routes/index');
var app = express();
var server = require('http').Server(app);

app.set('views', path.join (__dirname, 'views'));
app.set('view engine', 'ejs');


app.use('/', routes);


server.listen(port, function () {
    console.log('Express server listening on port ' + server.address().port);
});
