'use strict';

/**
 * A central error handler. Plugins will use this whenever they can.
 * For development purposes, throws the error; in production, you can
 * swap this out for something that, say, shows an error message or
 * sends the errors back to you for debugging purposes.
 *
 * @param {Error} err
 */
function errorHandler (err) {
  throw err
}

module.exports = errorHandler
