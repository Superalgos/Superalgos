chai      = require('chai')
Octokit   = require('../octokit').new
makeTests = require('./common').makeTests

assert = chai.assert
expect = chai.expect

# NodeJS does not have a btoa
btoa = (str) ->
  buffer = new Buffer str, 'binary'
  buffer.toString 'base64'

makeTests(assert, expect, btoa, Octokit)
