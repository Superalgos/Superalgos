# TODO: Use requirejs and require('chai')
assert = @chai.assert
expect = @chai.expect

@makeTests(assert, expect, btoa, @Octokit)


# from http://www.geekdave.com/2013/08/02/automated-code-coverage-enforcement-for-mocha-using-grunt-and-blanket/
if @PHANTOMJS
  @blanket.options('reporter', '../node_modules/grunt-blanket-mocha/support/grunt-reporter.js')

mocha.checkLeaks()
mocha.globals(['jQuery'])


# Needs to run once this file is loaded
mocha.run()
