const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const AUTH_CONFIG = require('../Auth0');
// Authentication middleware. When used, the
// if the access token exists, it be verified against
// the Auth0 JSON Web Key Set
const checkJwt = jwt({
  // Dynamically provide a signing key
  // based on the kid in the header and
  // the signing keys provided by the JWKS endpoint.
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 1,
    jwksUri: `https://${AUTH_CONFIG.domain}/.well-known/jwks.json`
  }),

  // Validate the audience and the issuer.
  credentialsRequired: false,
  audience: AUTH_CONFIG.api_audience,
  issuer: AUTH_CONFIG.issuer,
  algorithms: [`RS256`]
});

module.exports = checkJwt ;
