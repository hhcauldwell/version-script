#!/usr/bin/env node

var assert = require('assert');
var util = require('util');

var Promise = require('bluebird');
var yargs = require('yargs');
var _ = require('lodash');
var chalk = require('chalk');
var yaml = require('yamljs');

var argv = yargs.argv;

var scrapers = require('./lib/scrapers.js');

var config = yaml.load('./config.yml');

function Language(opts) {
  assert.equal(typeof opts, 'object');
  assert.equal(typeof opts.id, 'string');
  if (this instanceof Language) {
    this.opts = opts;
    this.id = opts.id;
  } else {
    return new Language(opts);
  }
}

Language.getAll = function() {
  return Language.get();
}

Language.get  = _.once(function() {
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
  return Promise.map(ids, function(id) {
    return new Language({
      id: id
    });
  });
});

var Docker = require('dockerode');

var opts = {
  docker: {
    host: '127.0.0.1',
    port: 2375
  }
};

var docker = new Docker({
  socketPath: '/var/run/docker.sock'
  //host: opts.docker.host,
  //port: opts.docker.port
});

function Image(opts) {
  assert.equal(typeof opts, 'object');
  assert.equal(typeof opts.id, 'string');
  assert.equal(typeof opts.data, 'object');
  if (this instanceof Image) {
    this.id = opts.id;
    this.data = opts.data;
    this.opts = opts;
  } else {
    return new Image(opts);
  }
}

Image.get = function(id) {
  assert.equal(typeof id, 'string');
  var self = this;
  var tag = 'us.gcr.io/coderpad-1189/coderpad:' + id;
  return Promise.fromNode(function(cb) {
    docker.listImages(cb);
  })
  .filter(function(image) {
    return _.includes(image.RepoTags, tag);
  })
  .then(function(images) {
    assert(images.length < 2);
    if (images.length === 1) {
      return new Image({
        id: id,
        data: images[0]
      });
    } else {
      throw new Error('Image not found: ' + id);
    }
  });
}

Image.prototype.version = function() {
  var version = _.get(this.data, 'Labels[\'version\']');
  if (!version) {
    //throw new Error('Version label not found.');
    version = 'Version label not found';
  }
  return Promise.resolve({
    version: version
  });
}

function Framework(opts) {
  assert(typeof opts, 'object');
  assert(typeof opts.id, 'string');
  if (this instanceof Framework) {
    this.opts = opts;
    this.id = opts.id;
  } else {
    return new Framework(opts);
  }
}

Framework.get = function(id) {
  if (typeof id === 'string') {
    return Promise.resolve(new Framework({id: id}));
  } else if (typeof id === 'undefined') {
    return Promise.resolve([
      new Framework({id: 'c'}),
      new Framework({id: 'javascript'}),
      new Framework({id: 'scala'})
    ]);
  } else {
    assert(false);
  }
}

Framework.prototype.version = function() {
  var url = _.get(config, 'languages[' + this.id + '].url');
  if (!url) {
    throw new Error('URL not found in config for ' + this.id);
  }
  var scraper = scrapers.WikiScraper({url: url});
  return scraper.scrape();
}

var totalChecks = 0;
var failedChecks = 0;

// Get list of all languages.
Language.getAll()
// Set total number of checks.
.tap(function(languages) {
  totalChecks = languages.length;
})
// Iterate in series over each language.
.mapSeries(function(language) {
  // Start.
  console.log('\nChecking: ' + language.id);
  return Promise.join(Image.get(language.id), Framework.get(language.id),
  function(image, framework) {
    return Promise.join(image.version(), framework.version(),
    function(imageVersion, frameworkVersion) {
      if (imageVersion.version === frameworkVersion.version) {
        console.log(chalk.gray(util.format('%s = %s',
          imageVersion.version,
          frameworkVersion.version
        )));
        console.log(chalk.green('Status: OK'));
      } else {
        failedChecks += 1;
        console.log(chalk.red(util.format('%s != %s',
          imageVersion.version,
          frameworkVersion.version
        )));
        console.log(chalk.red('Updated: ' + frameworkVersion.updated));
        console.log(chalk.red('Status: Failed'));
      }
    });
  })
  .catch(function(err) {
    failedChecks += 1;
    console.log(chalk.red('ERR: ' + err.message));
    console.log(chalk.red('ERR: ' + err.stack));
  });
})
.then(function() {
  if (failedChecks === 0) {
    console.log(chalk.green(util.format(
      '\nStatus: All %s checks passed.',
      totalChecks
    )));
  } else {
    console.log(chalk.red(util.format(
      '\nStatus: %s of %s total checks failed!',
      failedChecks,
      totalChecks
    )));
  }
  process.exit(failedChecks);
});
