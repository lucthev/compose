browserify := ./node_modules/.bin/browserify
babel := ./node_modules/.bin/babel
standard := ./node_modules/.bin/standard
uglifyjs := ./node_modules/.bin/uglifyjs
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
	$(karma) start test/karma.conf.js

publish: lint compose.min.js
	npm publish

clean:
	rm -rf lib/ compose.min.js

.PHONY: debug lint test integration-test publish clean
