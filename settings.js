/*  exports.dbConfig = {
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'otto',
      multipleStatements: true
  }*/
  exports.dbConfig="mongodb://localhost:27017/otto-test"


  // If you want to change the port change in /public/swagger/index.html - "  discoveryUrl: "http://localhost:5053/api-docs.json","for swagger UI
  exports.port = "5053"
  exports.baseURL = "http://localhost:5053";

  //Endpoint Declaration
  exports.discoveryEndpoint = "/.well-known/otto-configuration"
  exports.federations = "/otto/federations"
  exports.entity = "/otto/entity"
  exports.participant = "/otto/participant"
  exports.registrationAuthority = "/otto/registrationAuthority"
  exports.metadata = "/otto/metadata"
  exports.requirement = "/otto/requirement"
  exports.acr = "/otto/acr"
  exports.badge = "/otto/badge"
  exports.schema = "/otto/schema"

  exports.contextSchema = "https://rawgit.com/KantaraInitiative/wg-otto/master/html/otto-vocab-1.0.html"
  exports.contextOPSchema = "https://rawgit.com/KantaraInitiative/wg-otto/master/html/otto-openid-1.0.htm"
  exports.contextParticipant = "#participant"
  exports.contextFederation = "#federation"
  exports.contextEntity = "#entity"
  exports.contextRegistrationAuthority = "#registration-authority"
  exports.contextMetadata = "#metadata"
  exports.contextRequirement = "#requirement"
  exports.contextACR = "#acr"
  exports.contextBadge = "https://w3id.org/openbadges/v2"

  exports.trustMarkURL = '/trustmark/'  //@context URL
  exports.trustMarkFilePath = './public/trustmark/'
  exports.RA_NAME = 'otto-test'