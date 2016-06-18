#!/usr/bin/env node

var assert = require('assert');
var util = require('util');

var Promise = require('bluebird');
var yargs = require('yargs');
var _ = require('lodash');
var chalk = require('chalk');

var argv = yargs.argv;

var scrapers = require('./lib/scrapers.js');

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
  if (this instanceof Image) {
    this.id = opts.id;
    this.opts = opts;
  } else {
    return new Image(opts);
  }
}

Image.get = function(id) {
  if (typeof id === 'string') {
    return Promise.resolve(new Image({id: id}));
  } else if (typeof id === 'undefined') {
    /*return Promise.fromNode(function(cb) {
      docker.listImages(cb);
    })
    .then(function(images) {
      console.log(images);
    })*/
    return Promise.delay(1000)
    .then(function() {
      return Promise.resolve([
        new Image({id: 'c'}),
        new Image({id: 'javascript'}),
        new Image({id: 'scala'})
      ]);
    });
  } else {
    assert(false);
  }
}

Image.prototype.version = function() {
  // Stubbed out
  return Promise.resolve({version: '1.0.0'});
}

function Framework(opts) {
  if (this instanceof Framework) {
    this.opts = opts;
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
  //var url = 'https://en.wikipedia.org/wiki/Node.js';
  //var url = 'https://en.wikipedia.org/wiki/C_(programming_language)';
  var url = 'https://en.wikipedia.org/wiki/Scala_(programming_language)';
  var scraper = scrapers.WikiScraper({url: url});
  return scraper.scrape();
}

var failedChecks = 0;

// Get list of all languages.
Language.getAll()
// Iterate in series over each language.
.mapSeries(function(language) {
  // Start.
  console.log('Checking: ' + language.id);
  return Promise.join(Image.get(language.id), Framework.get(language.id),
  function(image, framework) {
    return Promise.join(image.version(), framework.version(),
    function(imageVersion, frameworkVersion) {
      if (imageVersion.version === frameworkVersion.version) {
        console.log(chalk.gray(util.format('%s = %s',
          imageVersion.version,
          frameworkVersion.version
        )));
        console.log(chalk.green('Status: OK\n'));
      } else {
        failedChecks += 1;
        console.log(chalk.red(util.format('%s != %s',
          imageVersion.version,
          frameworkVersion.version
        )));
        console.log(chalk.red('Status: Failed\n'));
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
    console.log(chalk.green('Status: All checks passed.'));
  } else {
    console.log(chalk.red('Status: ' + failedChecks + ' checks failed!'));
  }
  process.exit(failedChecks);
});

  /*return Framework.get(image.id)
  .then(function(framework) {
    return Promise.join(image.version(), framework.version(),
      function(imageVersion, frameworkVersion) {
        if (imageVersion.version === frameworkVersion.version) {
          console.log(chalk.gray(util.format('%s = %s',
            imageVersion.version,
            frameworkVersion.version
          )));
          console.log(chalk.green('Status: OK\n'));
        } else {
          failedChecks += 1;
          console.log(chalk.red(util.format('%s != %s',
            imageVersion.version,
            frameworkVersion.version
          )));
          console.log(chalk.red('Status: Failed\n'));
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
    console.log(chalk.green('Status: All checks passed.'));
  } else {
    console.log(chalk.red('Status: ' + failedChecks + ' checks failed!'));
  }
  process.exit(failedChecks);
});*/
