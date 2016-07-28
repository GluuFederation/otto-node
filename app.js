var http = require("http");
var port = "5053"; // If you want to change the port change in /public/swagger/index.html - "  discoveryUrl: "http://localhost:5053/api-docs.json","for swagger UI
var express = require('express');
var router = express.Router();
var path = require('path');
var swagger = require('swagger-express');
var routes = require('./routes/index');
var app = express();
var server = require('http').Server(app);

app.set('port', process.env.PORT || port);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

//Swagger Settings
app.use(swagger.init(app, {
  apiVersion: '1.0',
  swaggerVersion: '1.0.5',
  basePath: 'http://localhost:5053',
  swaggerURL: '/swagger',
  swaggerJSON: '/api-docs.json',
  swaggerUI: './public/swagger/',
  apis: ['./routes/index.js']
}));

app.use(express.static(path.join(__dirname, 'public')));


app.set('development', function(){
  app.use(express.errorHandler());
});

//View Engine
app.set('views', path.join (__dirname, 'views'));
app.set('view engine', 'ejs');

//All Routes
app.use('/', routes);


/*http.createServer(app).listen(port, function(){
  console.log("Express server listening on port " + port);
});*/


server.listen(port, function () {
    console.log('Express server listening on port ' + server.address().port);
});
