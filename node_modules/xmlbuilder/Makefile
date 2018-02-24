clean:
	@rm -fr lib/

release: clean
	@test `which coffee` || { echo 'You need to have CoffeeScript installed.'; exit 1; }
	@coffee -c -o lib src/*.coffee

test: release
	@coffee test/test.coffee

publish: release
	@test `which npm` || { echo 'You need to have npm installed.'; exit 1; }
	npm publish
	@rm -fr lib/

