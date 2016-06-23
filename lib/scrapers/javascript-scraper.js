'use strict';

// Nodejs modules.
var util = require('util');

// Default wiki scraper class.
var WikiScraper = require('./wiki-scraper.js');

// Load version class module.
var Version = require('../version.js');

/*
 * Constructor: extend the default wikipedia scraper.
 */
function JavascriptScraper(opts) {
  if (this instanceof JavascriptScraper) {
    opts.id = 'JavascriptScraper';
    WikiScraper.call(this, opts);
  } else {
    return new JavascriptScraper(opts);
  }
}
util.inherits(JavascriptScraper, WikiScraper);

/*
 * Override default version parser.
 */
JavascriptScraper.prototype.parseVersion = function(data) {
  // Split version text by newline and only use the second line.
  var parts = data.split('/');
  // Get version.
  var version = parts[0].split('&')[0].trim();
  parts = parts[1].split(';');
  // Get data.
  var date = parts[0].trim();
  // Return version info.
  return new Version({
    version: version,
    updated: date
  });
};

/*
 * Return constructor as module.
 */
module.exports = JavascriptScraper;
