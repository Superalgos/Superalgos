const jwksClient = require('jwks-rsa');
const jwt = require('jsonwebtoken');
const AUTH_CONFIG = require('./Auth0');

const jwks = jwksClient({
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 1,
  jwksUri: `https://${AUTH_CONFIG.domain}/.well-known/jwks.json`
})


const validateParseIdToken = idToken =>{
  return new Promise((resolve, reject) => {
    const { header, payload } = jwt.decode(idToken, { complete: true })
    if (!header || !header.kid || !payload) reject(new Error('[Validate Token Error] Invalid Token'))
    jwks.getSigningKey(header.kid, (err, key) => {
      if (err) reject(new Error('[Validate Token Error] Error getting signing key: ' + err.message))

      jwt.verify(
        idToken,
        key.publicKey,
        { algorithms: ['RS256'] },
        (err, decoded) => {

          if (err) reject('[Validate Token Error] ' + err.message);
          resolve(decoded);
        }
      )
    })
  })
}

module.exports = validateParseIdToken;
