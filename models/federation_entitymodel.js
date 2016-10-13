
var mongoose = require('mongoose');
var settings = require("../settings");
var Schema = mongoose.Schema;

var deepPopulate = require('mongoose-deep-populate')(mongoose);


var Federation_EntitySchema = new Schema({
  id:String,
  '@context':String,
  '@id':String,
  name: String,
  type : String,
  category : String,
  organizationId : {type :Schema.ObjectId,ref:'Organization'}

  //category:String
  // entityType:String,
  // address : {
  //   addressLine1 :String,
  //   addressLine2 : String,
  //   streetName : String,
  //   zipCode : String,
  //   city : String,
  //   state : String,
  //   country:String
  // }
},{strict:false});

Federation_EntitySchema.pre("save",function(next,done){
  
  this['@id']=settings.baseURL + settings.federation_entity+"/"+this._id;
  this['@context']=settings.baseURL + settings.federation_entity+"/entity.jsonld";
  next();
    
});

Federation_EntitySchema.plugin(deepPopulate, {
  whitelist: [
    'organizationId'
   ]
});

var Federation_Entity = mongoose.model('Federation_Entity', Federation_EntitySchema);
module.exports = Federation_Entity;


