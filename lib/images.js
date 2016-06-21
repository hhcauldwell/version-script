'use strict';

// Nodejs modules.
var assert = require('assert');

// Npm modules.
var _ = require('lodash');
var Promise = require('bluebird');
var Docker = require('dockerode');

// Load script config.
var config = require('./config.js').load();

// Create docker object instance.
var docker = new Docker({
  socketPath: '/var/run/docker.sock'
});

/*
 * Constructor.
 */
function Image(opts) {
  // Assert input.
  assert.equal(typeof opts, 'object');
  assert.equal(typeof opts.id, 'string');
  if (this instanceof Image) {
    this.id = opts.id;
    this.data = opts.data;
    this.opts = opts;
  } else {
    return new Image(opts);
  }
}

/*
 * Static function for getting an image object by id.
 */
Image.get = function(id) {
  // Assert input.
  assert.equal(typeof id, 'string');
  var self = this;
  // Build tag.
  var tag = [config.docker.tagPrefix, id].join(':');
  // Get list of images.
  return Promise.fromNode(function(cb) {
    docker.listImages(cb);
  })
  // Filter images by tag.
  .filter(function(image) {
    return _.includes(image.RepoTags, tag);
  })
  // Validate and return image.
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

/*
 * Returns the version of the image.
 */
Image.prototype.version = function() {
  var version = _.get(this.data, 'Labels[\'version\']');
  if (!version) {
    version = 'Version label for image not found';
  }
  return Promise.resolve({
    version: version
  });
}

/*
 * Return api.
 */
module.exports = {
  get: Image.get
};
