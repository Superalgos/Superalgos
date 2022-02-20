const env = require("../Environment")
const { rest } = require('msw')
const env = require('../../Environment').newEnvironment()
const externalScriptsURLs = env.EXTERNAL_SCRIPTS
const jQueryCtx = require('./contexts/jqueryCtx.json')
const jQueryUICtx = require('./contexts/jQueryUICtx.json')

let handlers = []

// setup handlers for all external scripts found in Environment.js

for (urlAddress in env.EXTERNAL_SCRIPTS) {

    if (urlAddress.includes(''))
		handlers.push(
			rest.get(urlAddress, (req, res, ctx) => {
				return res(
					ctx.status(200),
					ctx.json(jQueryCtx)
				)
			})
		)

}


module.exports = handlers