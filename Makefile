# Various programs
browserify := ./node_modules/.bin/browserify
standard := ./node_modules/.bin/standard
uglifyjs := ./node_modules/.bin/uglifyjs
mocha := ./node_modules/.bin/mocha
karma := ./node_modules/.bin/karma

# Build options
name := Compose
src := src/compose.js
all := $(shell $(browserify) --list $(src))

# Things for testing:
minor := 2.43
patch := 2.43.1

dist/compose.js: $(all)
	@mkdir -p dist
	$(browserify) -s $(name) $(src) | $(uglifyjs) -m -o $@

dist/compose.debug.js: $(all)
	@mkdir -p dist
	$(browserify) -s $(name) $(src) > $@

lint:
	$(standard)

unit-test: dist/compose.js
	$(karma) start test/unit/karma.conf.js

integration-test: dist/compose.js
	@test -f vendor/selenium-$(patch).jar || echo "Downloading Selenium server…"
	@test -f vendor/selenium-$(patch).jar || curl --create-dirs -o \
		vendor/selenium-$(patch).jar \
		http://selenium-release.storage.googleapis.com/$(minor)/selenium-server-standalone-$(patch).jar
	$(mocha) -t 120000 test/functional/*.spec.js

test: lint unit-test integration-test

publish: dist/compose.js
	npm publish

clean:
	rm -rf dist vendor

.PHONY: clean watch test debug lint unit-test integration-test publish
