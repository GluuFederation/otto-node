# [Open Trust Taxonomy for Federation Operators](https://github.com/KantaraInitiative/wg-otto/blob/master/README.md)

## Abstract

The Open Trust Taxonomy for Federation Operators (OTTO) is a set of API's and a linked data
schema to enable the formation of multi-party federations--where a central authority
creates the rules for membership, enabling the participants to more efficiently
collaborate. The goal of OTTO is to support a range of trust models from very low to
very high. By providing a framework for extension, in addition to a core set of
functionality and schema, the OTTO standard provides a scalable technical
infrastructure to solve organizational challenges in a number of different
ecosystems.

# otto-node

otto-node is implemented in node.js with swagger framework for apis which provides tools for designing and building Swagger-compliant APIs entirely in Node.js.

#### Configure the site

Currently this application is working on the port 5053, in case of changing the port you need to change at two places as following:
```
1) app.js var port = "5053";
2) /public/swagger/index.html discoveryUrl: "http://localhost:5053/api-docs.json"
```
# swagger
```
you can access all the apis details and testing environment with your {host}/swagger.
Example : localhost:5053/swagger
```

Endpoints
=================
#Discovery Endpoint

Registration Authority have metadata describing their configuration. These Registration Authority Metadata values are used by OTTO:

   * issuer - REQUIRED. URL using the https scheme with no query or fragment component that the RA asserts as its Issuer Identifier. If Issuer discovery is supported, this value MUST be identical to the issuer value returned by WebFinger.
   * federations_endpoint - REQUIRED. federations endpoint
   * federation_entity_endpoint - REQUIRED. federation entity endpoint
   * organizations_endpoint - REQUIRED. organization endpoint
   * schema_endpoint - REQUIRED. schema endpoint

Registration Authority supporting Discovery MUST make a JSON document available at the path formed by concatenating the string `/.well-known/otto-configuration` to the Issuer. The syntax and semantics of .well-known are defined in RFC 5785 [RFC5785] and apply to the Issuer value when it contains no path component. otto-configuration MUST point to a JSON document compliant with this specification and MUST be returned using the `application/json` content type.

*Non-normative example request*
```
GET /.well-known/otto-configuration 
```

The response is a set of Claims about the RA's configuration, including all necessary endpoints and public key location information. A successful response MUST use the 200 OK HTTP status code and return a JSON object using the `application/json` content type that contains a set of Claims as its members that are a subset of the RA's Metadata values. Other Claims MAY also be returned. Claims that return multiple values are represented as JSON arrays. Claims with zero elements MUST be omitted from the response. An error response uses the applicable HTTP status code value.

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
