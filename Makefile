# Various programs
browserify := ./node_modules/.bin/browserify
watchify := ./node_modules/.bin/watchify
jshint := ./node_modules/.bin/jshint
uglifyjs := ./node_modules/.bin/uglifyjs
mocha := ./node_modules/.bin/mocha
karma := ./node_modules/.bin/karma

# Build options
name := Compose
src := src/compose.js
dest := dist/compose.js

# Things for testing:
minor := 2.43
patch := 2.43.1

all:
	@mkdir -p dist
	$(browserify) -p bundle-collapser/plugin -s $(name) $(src) |\
		$(uglifyjs) -m > $(dest)

debug:
	@mkdir -p dist
	$(browserify) -s $(name) $(src) > $(dest)

watch:
	@mkdir -p dist
	$(watchify) -v -s $(name) -o $(dest) $(src)

lint:
	$(jshint) src test

unit-test: all
	$(karma) start test/unit/karma.conf.js

integration-test: all
	@test -f vendor/selenium-$(patch).jar || echo "Downloading Selenium server…"
	@test -f vendor/selenium-$(patch).jar || curl --create-dirs -o \
		vendor/selenium-$(patch).jar \
		http://selenium-release.storage.googleapis.com/$(minor)/selenium-server-standalone-$(patch).jar
	$(mocha) -t 120000 test/functional/*.spec.js

test: lint unit-test integration-test

clean:
	rm -rf dist vendor

.PHONY: clean test debug all lint unit-test
