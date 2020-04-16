function newWebhookFunctions () {
  thisObject = {
    sendTestMessage: sendTestMessage
  }

  return thisObject

  function sendTestMessage (node) {
    let testMessage = loadPropertyFromNodeConfig(node.payload, 'testMessage')
    let letURL = loadPropertyFromNodeConfig(node.payload, 'webhookURL')

    callServer(testMessage, letURL, onResponse)

    function onResponse (err) {
      console.log(err)
    }
  }
}
