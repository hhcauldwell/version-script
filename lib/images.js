'use strict';

// Nodejs modules.
var assert = require('assert');
var exec = require('child_process').exec;

// Npm modules.
var _ = require('lodash');
var Promise = require('bluebird');
var Docker = require('dockerode');
var memoryStreams = require('memory-streams');
var VError = require('verror');
var moment = require('moment');

// Load script config.
var config = require('./config.js').load();

// Load verion class module.
var Version = require('./version.js');

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
    this.updated = opts.updated;
    this.tag = opts.tag;
    // Get config.
    var langConfig = _.get(config, 'languages[' + opts.id + ']') || {};
    // Get command and make sure it's an array.
    this.cmd = langConfig.cmd;
    if (this.cmd && !_.isArray(this.cmd)) {
      this.cmd = this.cmd.split(' ');
    }
    // Get command parser.
    this.parser = langConfig['cmd-parser'];
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
  var tag = [config.docker.tagPrefix, id].join(':');
  return Promise.fromNode(function(cb) {
    docker.getImage(tag).inspect(cb);
  })
  .then(function(data) {
    assert.equal(typeof data, 'object');
    var opts = {
      id: id,
      tag: tag
    };
    return Promise.try(function() {
      opts.updated = moment(new Date(data.Created));
    })
    .catch(function() {
      opts.updated = null;
    })
    .return(new Image(opts));
  });
}

/*
 * Returns the version of the image.
 */
Image.prototype.version = function() {
  // Keep reference to this for later.
  var self = this;
  // Validate image command exists.
  if (!self.cmd) {
    return new Version({
      version: 'Image command not found.'
    });
  }
  // Create memory stream to catch stdout.
  var stdout = new memoryStreams.WritableStream();
  // Run container.
  return Promise.fromNode(function(cb) {
    docker.run(self.tag, self.cmd, stdout, cb);
  })
  // Make sure run completes in a reasonable amount of time.
  .timeout(30 * 1000)
  .then(function(result) {
    // Make sure status code is zero.
    if (result.StatusCode !== 0) {
      throw new Error('Container run failed: ' + self.cmd);
    }
    // Get output string.
    var data = stdout.toString().trim();
    // Get regex for parsing version.
    var regex = new RegExp(self.parser || '(.*)');
    // Parser version.
    var version = data.match(regex)[1];
    // Return version info object.
    return new Version({
      version: version,
      updated: self.updated
    });
  });
}

/*
 * Return api.
 */
module.exports = {
  get: Image.get
};
