var mongoose = require('mongoose');
var settings = require("../settings");

var connection =  mongoose.connect(settings.dbConfig, function (error) {
    if (error) {
        console.log(error);
    }
});

module.exports = connection;
