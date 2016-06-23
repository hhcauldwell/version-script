'use strict';

// Nodejs modules.
var util = require('util');

// Npm modules.
var _ = require('lodash');

// Default wiki scraper class.
var WikiScraper = require('./wiki-scraper.js');

// Load version class module.
var Version = require('../version.js');

/*
 * Constructor: extend the default wikipedia scraper.
 */
function JavaScraper(opts) {
  if (this instanceof JavaScraper) {
    opts.id = 'JavaScraper';
    WikiScraper.call(this, opts);
  } else {
    return new JavaScraper(opts);
  }
}
util.inherits(JavaScraper, WikiScraper);

/*
 * Override default version parser.
 */
JavaScraper.prototype.parseVersion = function(data) {
  var version = _.get(data.match(/[^(]*[(]([^-)]*)/), '[1]');
  var updated = _.get(data.match(/\(([A-Z][a-z]*[^;]*);/), '[1]');
  if (updated) {
    updated = this.parseDate(updated);
  }
  return new Version({
    version: version,
    updated: updated
  });
};

/*
 * Return constructor as module.
 */
module.exports = JavaScraper;
