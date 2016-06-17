#!/usr/bin/env node

var assert = require('assert');

var Promise = require('bluebird');
var yargs = require('yargs');
var _ = require('lodash');
var chalk = require('chalk');

var argv = yargs.argv;

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
    return Promise.resolve([
      new Image({id: 'c'}),
      new Image({id: 'javascript'}),
      new Image({id: 'scala'})
    ]);
  } else {
    assert(false);
  }
}

Image.prototype.version = function() {
  // Stubbed out
  return Promise.resolve('1.0.0');
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
  // Stubbed out.
  return Promise.delay(5000)
  .return('1.0.0');
}

var failedChecks = 0;

Image.get()
.mapSeries(function(image) {
  console.log('Checking: ' + image.id);
  return Framework.get(image.id)
  .then(function(framework) {
    return Promise.join(image.version(), framework.version(),
      function(imageVersion, frameworkVersion) {
        if (imageVersion === frameworkVersion) {
          console.log(chalk.green('Status: OK\n'));
        } else {
          failedChecks += 1;
          console.log(chalk.red('%s != %s', imageVersion, frameworkVersion));
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
