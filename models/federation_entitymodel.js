
var mongoose = require('mongoose');
var settings = require("../settings");
var Schema = mongoose.Schema;

var deepPopulate = require('mongoose-deep-populate')(mongoose);


// define the schema for openid connect provider
const Federation_EntitySchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  discoveryUrl: {
    type: String
    //unique: true
  },
  keys: {
    type: String,
    required: false
  },
  trustMarks: {
    type: String,
    required: false
  },
  clientId: {
    type: String,
    required: false
  },
  clientSecret: {
    type: String,
    required: false
  },
  oxdId: {
    type: String,
    required: false
  },
  scope: {
    type: String,
    required: false
  },
  state: {
    type: String,
    required: false //true
  },
  error: {
    type: String,
    required: false
  },
  errorDescription: {
    type: String,
    required: false
  },
  errorUri: {
    type: String,
    required: false
  },
  grantType: {
    type: String,
    required: false //true
  },
  code: {
    type: String,
    required: false //true
  },
  accessToken: {
    type: String,
    required: false
  },
  tokenType: {
    type: String,
    required: false
  },
  expiresIn: {
    type: String,
    required: false
  },
  username: {
    type: String,
    required: false
  },
  password: {
    type: String,
    required: false
  },
  refreshToken: {
    type: String,
    required: false
  },
  authorizationEndpoint: {
    type: String,
    required: false
  },
  redirectUris: {
    type: String,
    required: false
  },
  responseTypes: {
    type: String,
    required: false
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  isApproved: {
    type: Boolean,
    required: false
  },
  '@context': {
    type: String
  },
  '@id': {
    type: String
  },
  type : {
    type: String
  },
  category : {
    type: String
  },
  issuer: {
    type: String
  },
  metadataStatements: {
    type: mongoose.Schema.Types.Mixed
  },
  metadataStatementUris: {
    type: mongoose.Schema.Types.Mixed
  },
  signedJwksUri: {
    type: String
  },
  signingKeys: {
    type: String
  }
}, {
  timestamps: true
}, {
  strict:false
});

Federation_EntitySchema.pre("save",function(next,done){

  this['@id']=settings.baseURL + settings.federation_entity+"/"+this._id;
  this['@context']=settings.contextSchema + settings.contextOpenIdProvider;;
  next();

});

Federation_EntitySchema.plugin(deepPopulate, {
  whitelist: [
    'organization'
   ]
});

var Federation_Entity = mongoose.model('Provider', Federation_EntitySchema);
module.exports = Federation_Entity;


