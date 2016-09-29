# [Open Trust Taxonomy for Federation Operators](https://github.com/KantaraInitiative/wg-otto/blob/master/README.md)

## otto-node

otto-node is implemented in node.js with swagger framework for apis which provides tools for designing and building Swagger-compliant APIs entirely in Node.js.

### Configure the site

Currently this application is working on the port 5053, in case of changing the port you need to change at two places as following:
```
1) app.js var port = "5053";
2) /public/swagger/index.html discoveryUrl: "http://localhost:5053/api-docs.json"
```
### swagger
```
you can access all the apis details and testing environment with your {host}/swagger.
Example : localhost:5053/swagger
```

# Endpoints
================
## Discovery Endpoint

Registration Authority have metadata describing their configuration. These Registration Authority Metadata values are used by OTTO:

   * issuer - REQUIRED. URL using the https scheme with no query or fragment component that the RA asserts as its Issuer Identifier. If Issuer discovery is supported, this value MUST be identical to the issuer value returned by WebFinger.
   * federations_endpoint - REQUIRED. federations endpoint
   * federation_entity_endpoint - REQUIRED. federation entity endpoint
   * organizations_endpoint - REQUIRED. organization endpoint

*Non-normative example request*
```
GET /.well-known/otto-configuration 
```
*Non-normative example response*
```
HTTP/1.1 200 OK
Content-Type: application/json

{
   "issuer":"https://ra.com",
   "federations_endpoint":"https://ra.com/otto/federations",
   "federation_entity_endpoint":"https://ra.com/otto/entity",
   "organizations_endpoint":"https://ra.com/otto/organizations",
   "schema_endpoint":"https://ra.com/otto/schema"
}
```
## Federation Enpoint
```
GET /otto/federations
```
### Request 
Parameter | Param Type | Value Type | Description|Possible Values|Optional
----------|--- | -----|--------|----|-----
depth  | Query String| String |represents depth of graph resolving |(federation / federation.entities/federation.organization) | yes

### Response
Http Status  |Response
----------|--- 
200  | JSON Data
400 | {   "Error(s)": [     "unknown value for depth parameter"  ] }
500 | No Response

### Json Response Data with different depth parameter

#### GET /otto/federations
```
{
  "@context": "http://localhost:5053/otto/federation_list",
  "Federations": [
    "http://localhost:5053/otto/federations/57ebcd8f5b40c60764c38f39",
    "http://localhost:5053/otto/federations/57ecea728406a4082071f046",
    "http://localhost:5053/otto/federations/57ecea768406a4082071f047",
    "http://localhost:5053/otto/federations/57ecea798406a4082071f048",
    "http://localhost:5053/otto/federations/57ecea7c8406a4082071f049"
  ]
}
```
#### GET /otto/federations?depth=federation
```
{
  "@context": "http://localhost:5053/otto/federation_list",
  "Federations": [
    {
      "entities": [
        "http://localhost:5053/otto/federation_entity/57ebc0327f7f0b24e0893ddb"
      ],
      "name": "fed 1",
      "@id": "http://localhost:5053/otto/federations/57ebcd8f5b40c60764c38f39",
      "@context": "http://localhost:5053/otto/federations/federation.jsonld",
      "Organization": "http://localhost:5053/otto/organization/57ebcba8ef60420b2060e516"
    },
    {
      "entities": [],
      "name": "Fed 3",
      "@id": "http://localhost:5053/otto/federations/57ecea728406a4082071f046",
      "@context": "http://localhost:5053/otto/federations/federation.jsonld",
      "Organization": "http://localhost:5053/otto/organization/undefined"
    }
  ]
}
```
#### GET /otto/federations?depth=federation.entities

```
{
  {
  "@context": "http://localhost:5053/otto/federation_list",
  "Federations": [
    {
      "entities": [
        {
          "name": "kajdkja",
          "id": "http://ce.dev.gluu/rs",
          "@id": "http://localhost:5053/otto/federation_entity/57ebc0327f7f0b24e0893ddb",
          "@context": "http://localhost:5053/otto/federation_entity/entity.jsonld",
          "Organization": "http://localhost:5053/otto/organization/57ebcba8ef60420b2060e516"
        }
      ],
      "name": "fed 1",
      "@id": "http://localhost:5053/otto/federations/57ebcd8f5b40c60764c38f39",
      "@context": "http://localhost:5053/otto/federations/federation.jsonld",
      "Organization": "http://localhost:5053/otto/organization/57ebcba8ef60420b2060e516"
    },
    {
      "entities": [],
      "name": "Fed 3",
      "@id": "http://localhost:5053/otto/federations/57ecea728406a4082071f046",
      "@context": "http://localhost:5053/otto/federations/federation.jsonld",
      "Organization": "http://localhost:5053/otto/organization/undefined"
    }
  ]
}
```
#### GET /otto/federations?depth=federation.organization
```
{
  "@context": "http://localhost:5053/otto/federation_list",
  "Federations": [
    {
      "entities": [
        "http://localhost:5053/otto/federation_entity/57ebc0327f7f0b24e0893ddb"
      ],
      "name": "fed 1",
      "@id": "http://localhost:5053/otto/federations/57ebcd8f5b40c60764c38f39",
      "@context": "http://localhost:5053/otto/federations/federation.jsonld",
      "Organization": {
        "name": "org 222",
        "@id": "http://localhost:5053/otto/organization/57ebcba8ef60420b2060e516"
      }
    },
    {
      "entities": [],
      "name": "Fed 3",
      "@id": "http://localhost:5053/otto/federations/57ecea728406a4082071f046",
      "@context": "http://localhost:5053/otto/federations/federation.jsonld"
    }
  ]
}
```

#### Add Federation
```
Post /otto/federations
```
##### Request ( This includes required post params, query string params and path params )
Parameter | Param Type | Value Type | Description|Possible Values|Optional
----------|--- | -----|--------|----|-----
name  | post | String |Name of the federation | yes | No

##### Response
Http Status  |Response
----------|--- 
201  | JSON Data 
400 |  Request Schema not well formed.  Eg: ({   "Error(s)": [     "should have required property 'name'" ] })
500 | No Response

##### Json Data
HTTP/1.1 201 Created
```
{
  "@id": "http://localhost:5053/otto/federations/57ecea7c8406a4082071f049"
}
```
#### Edit Federation
```
Put /otto/federations/:federationid
```
##### Request ( This includes required post params, query string params and path params )
Parameter | Param Type | Value Type | Description|Optional
----------|--- | -----|--------|---------
name  | post | String |Name of the federation |   No
FederationId | Path | String | Federation Id | yes

##### Response

Http Status  |Response
----------|--- 
200  | No Response Data 
400 |  Request Schema not well formed.  Eg: ({   "Error(s)": [     "should have required property 'name'" ] })
400 | Invalid Federation Id
404 | Federation not found
500 | No Response Data

##### Json Data

HTTP/1.1 200 OK

#### Delete Federation
```
Delete /otto/federations/:federationid
```
##### Request ( This includes required post params, query string params and path params )
Parameter | Param Type | Value Type | Description|Optional
----------|--- | -----|--------|---------
FederationId | Path | String | Federation Id | yes

##### Response

Http Status  |Response
----------|--- 
200  | No Response Data 
400 | Invalid Federation Id
404 | Federation not found
500 | No Response Data

##### Json Data

HTTP/1.1 200 OK

#### Get Federation By ID
```
Get /otto/federations/:federationid
```
##### Request ( This includes required post params, query string params and path params )
Parameter | Param Type | Value Type | Description|Optional
----------|--- | -----|--------|---------
FederationId | Path | String | Federation Id | yes

##### Response

Http Status  |Response
----------|--- 
200  | JSON
400 | Invalid Federation Id
404 | Federation not found
500 | No Response Data

##### Json Data
```
{
  "@context": "http://localhost:5053/otto/federations/federation.jsonld",
  "@id": "http://localhost:5053/otto/federations/57ebcd8f5b40c60764c38f39",
  "name": "fed 1",
  "organization": {
    "@context": "http://localhost:5053/otto/federation_entity/organization.jsonld",
    "@id": "http://localhost:5053/otto/organization/57ebcba8ef60420b2060e516",
    "name": "org 222"
  },
  "entities": [
    {
      "@context": "http://localhost:5053/otto/federation_entity/entity.jsonld",
      "@id": "http://localhost:5053/otto/federation_entity/57ebc0327f7f0b24e0893ddb",
      "name": "kajdkja"
    }
  ]
}
```
#### Join Federation
```
post /otto/federations/:federationid /:entityid
```
##### Request ( This includes required post params, query string params and path params )
Parameter | Param Type | Value Type | Description|Optional
----------|--- | -----|--------|---------
federationid | Path | String | Federation Id | yes
entityid | Path | String | Entity Id | yes

##### Response

Http Status  |Response
----------|--- 
200  | No Response Data 
400 | Invalid Federation Id
400 | Invalid Entity Id
404 | Federation not found
404 | Entity not found
500 | No Response Data

##### Json Data

HTTP/1.1 200 OK

#### Join Federation
```
post /otto/federations/:federationid /
```
##### Request ( This includes required post params, query string params and path params )
Parameter | Param Type | Value Type | Description|Optional
----------|--- | -----|--------|---------
federationid | Path | String | Federation Id | yes
name | post | String | Entity Name | yes
id |post | String | reference linked data |yes

##### Response

Http Status  |Response
----------|--- 
200  | No Response Data 
400 | Invalid Federation Id
400 | Invalid Schema
404 | Federation not found
500 | No Response Data

##### Json Data

HTTP/1.1 200 OK

#### Leave Federation
```
delete /otto/federations/:federationid /:entityid
```
##### Request ( This includes required post params, query string params and path params )
Parameter | Param Type | Value Type | Description|Optional
----------|--- | -----|--------|---------
federationid | Path | String | Federation Id | yes
entityid | Path | String | Entity Id | yes

##### Response

Http Status  |Response
----------|--- 
200  | No Response Data 
400 | Invalid Federation Id
400 | Invalid Entity Id
404 | Federation not found
404 | Entity not found
500 | No Response Data

##### Json Data

HTTP/1.1 200 OK

## Federation Entity Enpoint
```
GET /otto/federations_entity
```
### Request 
Parameter | Param Type | Value Type | Description|Possible Values|Optional
----------|--- | -----|--------|----|-----

### Response
Http Status  |Response
----------|--- 
200  | JSON Data
500 | No Response

### Json Response 
#### GET /otto/federations_entity
```
{
  @context = "http://context_url",
  "Federation_Entity": [
    "http://localhost:5053/otto/federation_entity/57ebc0327f7f0b24e0893ddb"
  ]
}
```
#### Add Federation Entity
```
Post /otto/federations_entity
```
##### Request ( This includes required post params, query string params and path params )
Parameter | Param Type | Value Type | Description|Possible Values|Optional
----------|--- | -----|--------|----|-----
name  | post | String |Name of the federation Entity | yes | No

##### Response
Http Status  |Response
----------|--- 
201  | JSON Data 
400 |  Request Schema not well formed.  Eg: ({   "Error(s)": [     "should have required property 'name'" ] })
500 | No Response

##### Json Data
HTTP/1.1 201 Created
```
{
  "@id": "http://localhost:5053/otto/federations_entity/57ecea7c8406a4082071f049"
}
```
#### Edit Federation
```
Put /otto/federations_entity/:federationentityid
```
##### Request ( This includes required post params, query string params and path params )
Parameter | Param Type | Value Type | Description|Optional
----------|--- | -----|--------|---------
name  | post | String |Name of the federation |   No
federationentityid | Path | String | Federation Id | yes
name  | post | String |Name of the federation Entity | yes | No

##### Response

Http Status  |Response
----------|--- 
200  | No Response Data 
400 |  Request Schema not well formed.  Eg: ({   "Error(s)": [     "should have required property 'name'" ] })
400 | Invalid Federation Entity Id
404 | Federation Entity not found
500 | No Response Data

##### Json Data
HTTP/1.1 200 OK

#### Delete Federation
```
Delete /otto/federation_entity/:federationentityid
```
##### Request ( This includes required post params, query string params and path params )
Parameter | Param Type | Value Type | Description|Optional
----------|--- | -----|--------|---------
federationentityid | Path | String | Federation entity Id | yes

##### Response

Http Status  |Response
----------|--- 
200  | No Response Data 
400 | Invalid Federation Id
404 | Federation not found
500 | No Response Data

##### Json Data

HTTP/1.1 200 OK

#### Get Federation By ID
```
Get /otto/federation_entity/:federationentityid
```
##### Request ( This includes required post params, query string params and path params )
Parameter | Param Type | Value Type | Description|Optional
----------|--- | -----|--------|---------
federationentityid | Path | String | Federation  Entity Id | yes

##### Response

Http Status  |Response
----------|--- 
200  | JSON
400 | Invalid Federation Entity Id
404 | Federation not found
500 | No Response Data

##### Json Data
```
{
  "@context": "http://localhost:5053/otto/federations/federation.jsonld",
  "@id": "http://localhost:5053/otto/federations/57ebcd8f5b40c60764c38f39",
  "name": "fed 1",
  "organizationId": {
    "@context": "http://localhost:5053/otto/federation_entity/organization.jsonld",
    "@id": "http://localhost:5053/otto/organization/57ebcba8ef60420b2060e516",
    "name": "org 222"
  },
  "entities": [
    {
      "@context": "http://localhost:5053/otto/federation_entity/entity.jsonld",
      "@id": "http://localhost:5053/otto/federation_entity/57ebc0327f7f0b24e0893ddb",
      "name": "kajdkja"
    }
  ]
}
```
## Organization Endpoint
```
GET /otto/organization
```
### Request 
Parameter | Param Type | Value Type | Description|Possible Values|Optional
----------|--- | -----|--------|----|-----

### Response
Http Status  |Response
----------|--- 
200  | JSON Data
500 | No Response

### Json Response 
#### GET /otto/organization
```
{
  @context = "http://context_url",
 "Organization": [
    "http://localhost:5053/otto/organization/57ebcba8ef60420b2060e516"
  ]
}
```
#### Add Organization
```
Post /otto/organization
```
##### Request ( This includes required post params, query string params and path params )
Parameter | Param Type | Value Type | Description|Possible Values|Optional
----------|--- | -----|--------|----|-----
name  | post | String |Name of the federation Entity | yes | No

##### Response
Http Status  |Response
----------|--- 
201  | JSON Data 
400 |  Request Schema not well formed.  Eg: ({   "Error(s)": [     "should have required property 'name'" ] })
500 | No Response

##### Json Data
HTTP/1.1 201 Created
```
{
  "@id": "http://localhost:5053/otto/organization/57ecea7c8406a4082071f049"
}
```
#### Edit Organization
```
Put /otto/organization/:organizationid
```
##### Request ( This includes required post params, query string params and path params )
Parameter | Param Type | Value Type | Description|Optional
----------|--- | -----|--------|---------
name  | post | String |Name of the federation |   No
organizationid | Path | String | Organization Id | yes
name  | post | String |Name of Organization| yes | No

##### Response

Http Status  |Response
----------|--- 
200  | No Response Data 
400 |  Request Schema not well formed.  Eg: ({   "Error(s)": [     "should have required property 'name'" ] })
400 | Invalid Organization Id
404 | Organization not found
500 | No Response Data

##### Json Data
HTTP/1.1 200 OK

#### Delete Organization
```
Delete /otto/organizationid/:organizationid
```
##### Request ( This includes required post params, query string params and path params )
Parameter | Param Type | Value Type | Description|Optional
----------|--- | -----|--------|---------
organizationid | Path | String | Organization Id | yes

##### Response

Http Status  |Response
----------|--- 
200  | No Response Data 
400 | Invalid Organization Id
404 | Organization not found
500 | No Response Data

##### Json Data

HTTP/1.1 200 OK

#### Get Organization By ID
```
Get /otto/organization/:organizationid
```
##### Request ( This includes required post params, query string params and path params )
Parameter | Param Type | Value Type | Description|Optional
----------|--- | -----|--------|---------
organizationid | Path | String | Organization Id | yes

##### Response

Http Status  |Response
----------|--- 
200  | JSON
400 | Invalid Organization Id
404 | Organization not found
500 | No Response Data

##### Json Data
```
{
  "entities": [
    "http://localhost:5053/otto/federation_entity/null"
  ],
  "federations": [
    "http://localhost:5053/otto/federations/57ebcd8f5b40c60764c38f39",
    "http://localhost:5053/otto/federations/57ebcd8f5b40c60764c38f39"
  ],
  "name": "org 222",
  "@id": "http://localhost:5053/otto/organization/57ebcba8ef60420b2060e516",
  "@context": "http://localhost:5053/otto/federation_entity/organization.jsonld"
}
```
#### Join Organization (Federation)
```
post /otto/organization/:organizationid/federation /:federationid
```
##### Request ( This includes required post params, query string params and path params )
Parameter | Param Type | Value Type | Description|Optional
----------|--- | -----|--------|---------
federationid | Path | String | Federation Id | yes
organizationid | Path | String | Organization Id | yes

##### Response

Http Status  |Response
----------|--- 
200  | No Response Data 
400 | Invalid Federation Id
400 | Invalid Organization Id
404 | Organization not found
404 | Federation not found
500 | No Response Data

##### Json Data
HTTP/1.1 200 OK

#### Join Organization (Entity)
```
post /otto/organization/:organizationid/entity/:federationentityid
```
##### Request ( This includes required post params, query string params and path params )
Parameter | Param Type | Value Type | Description|Optional
----------|--- | -----|--------|---------
federationentityid | Path | String | Entity Id | yes
organizationid | Path | String | Organization Id | yes

##### Response

Http Status  |Response
----------|--- 
200  | No Response Data 
400 | Invalid Organization Id
400 | Invalid Entity Id
404 | Organization not found
404 | Entity not found
500 | No Response Data

##### Json Data

HTTP/1.1 200 OK





















