const { rest } = require('msw')
const env = require('../../Environment').newEnvironment()
const externalScriptsURLs = env.EXTERNAL_SCRIPTS
const jQueryCtx = require('./contexts/jqueryCtx.json')
const jQueryUICtx = require('./contexts/jQueryUICtx.json')

let handlers = []

handlers.push(
	rest.get('https://code.jquery.com/jquery-3.6.0.js', (req, res, ctx) => {
		return res(
			ctx.status(200),
			ctx.json({
				type: "jquery",
				status: "ok"
			})
			)
	})
)

// setup handlers for all external scripts found in Environment.js
// don't forget you MUST use absolute paths for all handlers
// for (urlAddress in env.EXTERNAL_SCRIPTS) {
//     if (/jquery-ui/.test(urlAddress)) {
// 		handlers.push(
// 			rest.get(urlAddress, (req, res, ctx) => {
// 				return res(
// 					ctx.status(200),
// 					ctx.json({
// 						type: "jquery"
// 					})
// 				)
// 			})
// 		)
// 		continue
// 	}
// 	if (/jquery-\d.\d.\d/.test(urlAddress)) {
// 		handlers.push(
// 			rest.get(urlAddress, (req, res, ctx) => {
// 				return res(
// 					ctx.status(200),
// 					ctx.json({
// 						type: "jquery-ui"
// 					})
// 				)
// 			})
// 		)
// 		continue
// 	}


// }


module.exports = handlers