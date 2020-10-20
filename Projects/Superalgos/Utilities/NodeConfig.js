function newSuperalgosUtilitiesNodeConfig() {
    thisObject = {
        savePropertyAtNodeConfig: savePropertyAtNodeConfig,
        loadPropertyFromNodeConfig: loadPropertyFromNodeConfig
    }

    return thisObject

    function savePropertyAtNodeConfig(payload, propertyName, value) {
        try {
            let config = JSON.parse(payload.node.config)
            config[propertyName] = value
            payload.node.config = JSON.stringify(config, null, 4)
        } catch (err) {
            // we ignore errors here since most likely they will be parsing errors.
        }
    }

    function loadPropertyFromNodeConfig(payload, propertyName) {
        try {
            let config = JSON.parse(payload.node.config)
            return config[propertyName]
        } catch (err) {
            // we ignore errors here since most likely they will be parsing errors.
        }
    }
}