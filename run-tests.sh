#!/bin/bash

echo "Compiling files..."
./node_modules/.bin/gulp js

for test in "./node_modules/karma/bin/karma start karma.conf.js" "./node_modules/.bin/mocha -t 30000 test/functional/"; do

  printf "\n"
  echo "Running: ${test}"
  $test

  if [ $? -ne 0 ]; then
    exit 1
  fi
done
