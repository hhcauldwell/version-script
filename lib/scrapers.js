'use strict';

var WikiScraper = require('./scrapers/wiki-scraper.js');
var JavascriptScraper = require('./scrapers/javascript-scraper.js');
var PythonScraper = require('./scrapers/python-scraper.js');

module.exports = {
  WikiScraper: WikiScraper,
  JavascriptScraper: JavascriptScraper,
  PythonScraper: PythonScraper
};
