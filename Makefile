browserify := ./node_modules/.bin/browserify
babel := ./node_modules/.bin/babel
standard := ./node_modules/.bin/standard
uglifyjs := ./node_modules/.bin/uglifyjs
mocha := ./node_modules/.bin/mocha
karma := ./node_modules/.bin/karma

srcfiles := $(wildcard src/*.js)
libfiles := $(patsubst src/%.js,lib/%.js,$(srcfiles))

compose.min.js: $(libfiles)
	$(browserify) -s Compose lib/compose.js | $(uglifyjs) -m -o $@

debug: $(libfiles)
	$(browserify) -s Compose lib/compose.js -o compose.min.js

lib/%.js: src/%.js
	@mkdir -p lib
	$(babel) $< -o $@

lint:
	$(standard) src/**/*.js

test: compose.min.js
	$(karma) start test/unit/karma.conf.js

integration-test: compose.min.js
	@test -f vendor/selenium-$(patch).jar || echo "Downloading Selenium server…"
	@test -f vendor/selenium-$(patch).jar || curl --create-dirs -o \
		vendor/selenium-$(patch).jar \
		http://selenium-release.storage.googleapis.com/$(minor)/selenium-server-standalone-$(patch).jar
	$(mocha) -t 120000 test/functional/*.spec.js

publish: lint compose.min.js
	npm publish

clean:
	rm -rf lib/ compose.min.js

.PHONY: debug lint test integration-test publish clean
