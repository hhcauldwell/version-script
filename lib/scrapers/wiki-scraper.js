'use strict';

// Nodejs modules.
var assert = require('assert');
var http = require('http');
var https = require('https');

// Npm modules.
var cheerio = require('cheerio');
var Promise = require('bluebird');
var moment = require('moment');

//Load version class module.
var Version = require('../version.js');

/*
 * Constructor.
 */
function WikiScraper(opts) {
  // Assert the input.
  assert.equal(typeof opts, 'object');
  assert.equal(typeof opts.url, 'string');
  if (this instanceof WikiScraper) {
    this.id = opts.id || 'WikipediaScraper';
    this.opts = opts;
    this.url = opts.url;
  } else {
    return new WikiScraper(opts);
  }
}

/*
 * Main scraping method.
 */
WikiScraper.prototype.scrape = function() {
  var self = this;
  // Get the html text of the wiki url.
  return Promise.fromNode(function(cb) {
    https.get(self.url, function(res) {
      // Report failure.
      if (res.statusCode !== 200) {
        return cb(new Error('StatusCode: ' + res.statusCode));
      }
      // Build and return html data.
      var data = '';
      res.on('data', function(chunk) {
        data += chunk;
      });
      res.on('end', function() {
        cb(null, data);
      });
    });
  })
  // Parse the html into version info.
  .then(function(data) {
    return self.parseHtml(data);
  })
  // Parse version info into a version object.
  .then(function(data) {
    return self.parseVersion(data);
  })
  // Make sure the operation completes in a reaonsable amount of time.
  .timeout(30 * 1000);
};

/*
 * Parse html to get version text.
 */
WikiScraper.prototype.parseHtml = function(htmlData) {
  var $ = cheerio.load(htmlData);
  return $('.infobox')
    .text()
    .match(/Stable release\n(.*\n.*)/)[1]
    .replace(/\[[0-9]\]/, '').trim();
};

/*
 * Parse date and handle different date formats.
 */
WikiScraper.prototype.parseDate = function(s) {
  // Remove non-ascii characters because they aren't helpful here.
  s = s.replace(/[^\x00-\x7F]/g, ' ')
  // Handle non standard dates.
  var nonStdDate = s.match(/([0-9]*) ([A-Za-z]*) ([0-9]*)/);
  if (nonStdDate) {
    return moment(new Date([
      nonStdDate[2],
      nonStdDate[1] + ',',
      nonStdDate[3]
    ].join(' ')));
  } else {
    return moment(new Date(s));
  }
};

/*
 * Parser version text into version info object.
 */
WikiScraper.prototype.parseVersion = function(data) {
  var self = this;
  var parts = data.split('/');
  var version = parts[0].trim();
  parts = parts[1].split(';');
  var date = parts[0].trim();
  var duration = parts[1].trim();
  return new Version({
    version: version,
    updated: self.parseDate(date)
  });
};

/*
 * Return constructor as module.
 */
module.exports = WikiScraper;
