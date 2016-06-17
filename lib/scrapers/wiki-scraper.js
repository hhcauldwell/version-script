'use strict';

var assert = require('assert');
var http = require('http');
var https = require('https');

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
  //var url = 'https://en.wikipedia.org/wiki/Node.js';
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
        console.log(data.length);
        cb(null, data);
      });
    });
  })
  .then(function(data) {
    return '1.0.0';
  })
  .timeout(30 * 1000);
}

module.exports = WikiScraper;
