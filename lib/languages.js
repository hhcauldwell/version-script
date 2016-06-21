'use strict';

// Nodejs modules.
var assert = require('assert');

// Npm modules.
var _ = require('lodash');
var Promise = require('bluebird');

// Load config file.
var config = require('./config.js').load();

// Load scrapers module.
var scrapers = require('./scrapers.js');

/*
 * Constructor.
 */
function Language(opts) {
  // Assert input.
  assert.equal(typeof opts, 'object');
  assert.equal(typeof opts.id, 'string');
  if (this instanceof Language) {
    this.opts = opts;
    this.id = opts.id;
  } else {
    return new Language(opts);
  }
}

/*
 * Static method to get list of languages.
 */
Language.getAll  = _.once(function() {
  // TODO: get from folders.
  // TODO: assert number of languages.
  var ids = [
    'c',
    'clojure',
    'coffeescript',
    'cpp',
    'csharp',
    'erlang',
    'go',
    'haskell',
    'java',
    'javascript',
    'mysql',
    'objc',
    'perl',
    'php',
    'python',
    'python3',
    'r',
    'ruby',
    'scala',
    'swift',
    'vb'
  ];
  // Map language ids to a language object.
  return Promise.map(ids, function(id) {
    return new Language({
      id: id
    });
  });
});

/*
 * Static method for getting an instance of a language.
 */
Language.get = function(id) {
  assert.equal(typeof id, 'string');
  return Promise.resolve(new Language({id: id}));
}

/*
 * Returns version info object.
 */
Language.prototype.version = function() {
  var url = _.get(config, 'languages[' + this.id + '].url');
  if (!url) {
    throw new Error('URL not found in config for ' + this.id);
  }
  var scraperConfig = _.get(config, 'languages[' + this.id + '].scraper');
  var scraperKind = _.get(scraperConfig, 'kind') || scraperConfig || 'WikiScraper';
  var scraperOpts = _.get(scraperConfig, 'opts') || {};
  scraperOpts.url = url;
  var scraper = _.get(scrapers, scraperKind);
  if (!scraper) {
    throw new Error(util.format(
      'Scraper %s not found for %s',
      this.id,
      JSON.stringify(scraperConfig)
    ));
  }
  return scraper(scraperOpts).scrape();
}

/*
 * Return api.
 */
module.exports = {
  getAll: Language.getAll,
  get: Language.get
};
