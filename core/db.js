var mongoose = require('mongoose');
var settings = require("../settings");
var Promise = require("bluebird");
console.log("connection is going on");
mongoose.Promise = Promise;


var connection =  mongoose.connect(settings.dbConfig, function (error) {
    if (error) {
        console.log(error);
    }
});

module.exports = connection;
