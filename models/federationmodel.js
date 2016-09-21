
var mongoose = require('mongoose');
var settings = require("../settings");
var Schema = mongoose.Schema;


var FederationSchema = new Schema({
  
  '@context':String,
  '@id':String,
  name: String,
  entites :[{type :Schema.ObjectId, ref: 'Federation_Entity'}]

});


FederationSchema.pre("save",function(next,done){
  
  this['@id']=settings.baseURL + settings.federations+"/"+this._id;
  this['@context']=settings.baseURL + settings.federations+"/federation.jsonld";
  next();
    
});



var Federation = mongoose.model('Federation', FederationSchema);
module.exports = Federation;
