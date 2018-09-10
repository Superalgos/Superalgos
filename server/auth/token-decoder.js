const MODULE_NAME = "token-decoder";

/*
   JSON Web Token (JWT) is a compact, URL-safe means of representing
   claims to be transferred between two parties.  The claims in a JWT
   are encoded as a JSON object that is used as the payload of a JSON
   Web Signature (JWS) structure or as the plaintext of a JSON Web
   Encryption (JWE) structure, enabling the claims to be digitally
   signed or integrity protected with a Message Authentication Code
   (MAC) and/or encrypted.
*/

const JSONWebToken = require('jsonwebtoken'); // A library to deal with JSON Web Tokens.
const webTokenLibrary = require('jwks-rsa');   // A library to retrieve RSA signing keys from a JWKS (JSON Web Key Set) endpoint.

const AUTH_CONFIG = require('./Auth0');       // Config where we have our secrets.

const decoder = webTokenLibrary({
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 1,
  jwksUri: `https://${AUTH_CONFIG.domain}/.well-known/jwks.json`
})

function decodeToken (token, callBackFunction) {

  try{

    if (global.INFO_LOG === true) { console.log("[INFO] " + MODULE_NAME + " -> decodeToken -> Entering function."); }

    const decoded = JSONWebToken.decode(token, { complete: true });
    const header = decoded.header;
    const payload = decoded.payload;

    if (
      header === null ||
      header.kid === null ||
      payload === null
    ) {
        if (global.ERROR_LOG === true) { console.log ("[ERROR] " + MODULE_NAME + " -> decodeToken -> Invalid Token. "); }
        if (global.ERROR_LOG === true) { console.log ("[ERROR] " + MODULE_NAME + " -> decodeToken -> token = " + token); }
        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        return;
    }

    decoder.getSigningKey(header.kid, onKeyReady);

    function onKeyReady(err, key) {

      if (global.INFO_LOG === true) { console.log("[INFO] " + MODULE_NAME + " -> decodeToken -> onKeyReady -> Entering function."); }

      if (err) {

        if (global.ERROR_LOG === true) { console.log ("[ERROR] " + MODULE_NAME + " -> decodeToken -> onKeyReady -> Error getting the key. "); }
        if (global.ERROR_LOG === true) { console.log ("[ERROR] " + MODULE_NAME + " -> decodeToken -> onKeyReady -> key = " + key); }
        if (global.ERROR_LOG === true) { console.log ("[ERROR] " + MODULE_NAME + " -> decodeToken -> onKeyReady -> err = " + err); }
        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        return;
      }

      JSONWebToken.verify(
        token,
        key.publicKey,
        { algorithms: ['RS256'] },
        onVerified);

        function onVerified(err, decoded) {

          if (global.INFO_LOG === true) { console.log("[INFO] " + MODULE_NAME + " -> decodeToken -> onKeyReady -> onVerified -> Entering function."); }

          if (err) {

            if (global.ERROR_LOG === true) { console.log ("[ERROR] " + MODULE_NAME + " -> decodeToken -> onKeyReady -> onVerified -> Error verifying. "); }
            if (global.ERROR_LOG === true) { console.log ("[ERROR] " + MODULE_NAME + " -> decodeToken -> onKeyReady -> onVerified -> decoded = " + decoded); }
            if (global.ERROR_LOG === true) { console.log ("[ERROR] " + MODULE_NAME + " -> decodeToken -> onKeyReady -> onVerified -> err = " + err); }
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
            return;
          }

          callBackFunction(global.DEFAULT_OK_RESPONSE, decoded);
        }
    }
  } catch(err) {

    if (global.ERROR_LOG === true) { console.log("[ERROR] " + MODULE_NAME + " -> decodeToken -> err = " + err); }
    callBackFunction(global.DEFAULT_FAIL_RESPONSE);

  }
}

module.exports = decodeToken;
