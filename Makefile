browserify := ./node_modules/.bin/browserify
babel := ./node_modules/.bin/babel
standard := ./node_modules/.bin/standard
karma := ./node_modules/.bin/karma

srcfiles := $(wildcard src/*.js)
libfiles := $(patsubst src/%.js,lib/%.js,$(srcfiles))

compose.js: $(libfiles)
	$(browserify) --debug -s Compose lib/compose.js -o compose.js

lib/%.js: src/%.js
	@mkdir -p lib
	$(babel) --presets=es2015 --source-maps=inline $< -o $@

lint:
	$(standard) src/**/*.js

test: compose.js
	$(karma) start test/karma.conf.js

publish: lint compose.js
	npm publish

clean:
	rm -rf lib/ compose.js

.PHONY: lint test publish clean
