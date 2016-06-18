'use strict';

var assert = require('assert');
var http = require('http');
var https = require('https');

var cheerio = require('cheerio');
var Promise = require('bluebird');

function WikiScraper(opts) {
  assert.equal(typeof opts, 'object');
  assert.equal(typeof opts.url, 'string');
  if (this instanceof WikiScraper) {
    this.id = 'WikipediaScraper';
    this.opts = opts;
    this.url = opts.url;
  } else {
    return new WikiScraper(opts);
  }
}

WikiScraper.prototype.scrape = function() {
  var self = this;
  return Promise.fromNode(function(cb) {
    https.get(self.url, function(res) {
      if (res.statusCode !== 200) {
        return cb(new Error('StatusCode: ' + res.statusCode));
      }
      var data = '';
      res.on('data', function(chunk) {
        data += chunk;
      });
      res.on('end', function() {
        cb(null, data);
      });
    });
  })
  .then(function(data) {
    // TODO: this needs to be cleaner, and annotations need to be taken out of
    // version numebers.
    var $ = cheerio.load(data);
    var table = $('.infobox').text();
    var info = table.match(/Stable release\n(.*)\n/)[1];
    var parts = info.split('/');
    var version = parts[0].trim();
    parts = parts[1].split(';');
    var date = parts[0].trim();
    var duration = parts[1].trim();
    return {
      version: version,
      updated: date
    };
  })
  .timeout(30 * 1000);
}

module.exports = WikiScraper;
