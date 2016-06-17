#!/usr/bin/env node

var assert = require('assert');

var Promise = require('bluebird');
var yargs = require('yargs');
var _ = require('lodash');

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
  return Promise.resolve('1.0.0');
}

Promise.join(
  Image.get(),
  Framework.get(),
  function(images, frameworks) {
    return Promise.each(images, function(image) {
      console.log(image.id);
    });
  }
);
