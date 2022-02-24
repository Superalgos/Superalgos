exports.newVisualScriptingUtilitiesNodeConfiguration = function newVisualScriptingUtilitiesNodeConfiguration() {
    let thisObject = {
        saveConfigProperty: saveConfigProperty,
        loadConfigProperty: loadConfigProperty
    }

    return thisObject

    function saveConfigProperty(node, propertyName, value) {
        try {
            let config = JSON.parse(node.config)
            config[propertyName] = value
            node.config = JSON.stringify(config, null, 4)
        } catch (err) {
            // we ignore errors here since most likely they will be parsing errors.
        }
    }

    function loadConfigProperty(node, propertyName) {
        try {
            let config = JSON.parse(node.config)
            return config[propertyName]
        } catch (err) {
            // we ignore errors here since most likely they will be parsing errors.
        }
    }
}