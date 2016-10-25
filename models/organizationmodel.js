
var mongoose = require('mongoose');
var settings = require("../settings");
var Schema = mongoose.Schema;


var OrganizationSchema = new Schema({
  '@context':String,
  '@id':String,
  name: String,
   entities :[{type :Schema.ObjectId, ref: 'Federation_Entity'}],
   federations :[{type :Schema.ObjectId, ref: 'Federation'}]

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

 OrganizationSchema.pre("save",function(next,done){
  
   this['@id']=settings.baseURL + settings.organization+"/"+this._id;
   this['@context']=settings.baseURL + settings.federation_entity+"/organization.jsonld";
   //console.log(this);  
   next();
    
});

var Organization = mongoose.model('Organization', OrganizationSchema);
module.exports = Organization;


