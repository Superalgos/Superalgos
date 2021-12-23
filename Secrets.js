exports.newSecrets = function newSecrets () {
 
    let thisObject = {
        initialize: initialize
    }

    return thisObject

    function initialize() {

        SA.secrets = {
            signingAccountSecrets: {
                array: [],
                map: new Map()
            },
            apisSecrets: {
                array: [],
                map: new Map()
            }
        }

        try {
            SA.secrets.signingAccountSecrets.array = require('./My-Secrets/SigningAccountsSecrets.json').secrets
        } catch (err) {
            // Still have an empty array.
        }

        try {
            SA.secrets.apisSecrets.array = require('./My-Secrets/ApisSecrets.json').secrets
        } catch (err) {
            // Still have an empty array.
        }

        for (let i = 0; i < SA.secrets.signingAccountSecrets.array.length; i++) {
            let secret = SA.secrets.signingAccountSecrets.array[i]
            SA.secrets.signingAccountSecrets.map.set(secret.nodeCodeName, secret)
        }

        for (let i = 0; i < SA.secrets.apisSecrets.array.length; i++) {
            let secret = SA.secrets.apisSecrets.array[i]
            SA.secrets.apisSecrets.map.set(secret.nodeCodeName, secret)
        }
    }
}