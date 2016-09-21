var http = require("http");
var express = require('express');
var router = express.Router();
var path = require('path');
var swagger = require('swagger-express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var app = express();
var server = require('http').Server(app);
var settings = require("./settings");
var db = require('./core/db');

//routes
var routesIndex = require('./routes/index');
var routesFederations = require('./routes/federation');
var routesFederationsEntity = require('./routes/federation_entity');

app.set('port', process.env.PORT || settings.port);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


//Swagger Settings
app.use(swagger.init(app, {
    apiVersion: '1.0',
    swaggerVersion: '1.0.5',
    basePath: settings.baseURL,
    swaggerURL: '/swagger',
    swaggerJSON: '/api-docs.json',
    swaggerUI: './public/swagger/',
    apis: ['./routes/index.js','./routes/federation_entity.js' , './routes/federation.js']
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.set('development', function() {
    app.use(express.errorHandler());
});

//View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//All Routes
app.use('/', routesIndex);
app.use('/', routesFederations);
app.use('/', routesFederationsEntity);


server.listen(settings.port, function() {
    console.log('-------------------------------------------------------------------');
    console.log('Server started successfully!, Open this URL ' + settings.baseURL);
    console.log('-------------------------------------------------------------------');
});
