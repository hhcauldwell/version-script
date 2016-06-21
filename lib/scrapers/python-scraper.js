'use strict';

// Nodejs modules.
var util = require('util');

// Default wiki scraper class.
var WikiScraper = require('./wiki-scraper.js');

/*
 * Constructor: extend the default wikipedia scraper.
 */
function PythonScraper(opts) {
  if (this instanceof PythonScraper) {
    opts.id = 'PythonScraper';
    WikiScraper.call(this, opts);
  } else {
    return new PythonScraper(opts);
  }
}
util.inherits(PythonScraper, WikiScraper);

/*
 * Override default version parser.
 */
PythonScraper.prototype.parseVersion = function(data) {
  // Split version text by newline and only use the second line.
  var parts = data.split('\n')[1].split('/');
  // Get version.
  var version = parts[0].trim();
  parts = parts[1].split(';');
  // Get data.
  var date = parts[0].trim();
  // Return version info.
  return {
    version: version,
    updated: date
  };
};

/*
 * Return constructor as module.
 */
module.exports = PythonScraper;
