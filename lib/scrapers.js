'use strict';

var WikiScraper = require('./scrapers/wiki-scraper.js');
var JavaScraper = require('./scrapers/java-scraper.js');
var JavascriptScraper = require('./scrapers/javascript-scraper.js');
var PythonScraper = require('./scrapers/python-scraper.js');

module.exports = {
  WikiScraper: WikiScraper,
  JavaScraper: JavaScraper,
  JavascriptScraper: JavascriptScraper,
  PythonScraper: PythonScraper
};
