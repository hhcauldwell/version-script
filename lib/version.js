'use strict';

// Npm modules.
var _ = require('lodash');
var assert = require('assert');

// Regex pattern for matching semantic versioning.
var semanticPattern = /([0-9]*)\.([0-9]*)\.([0-9]*)/;

/*
 * Constuctor.
 */
function Version(opts) {
  if (this instanceof Version) {
    this.opts = opts;
    this.version = opts.version;
    this.updated = opts.updated;
  } else {
    return new Version(opts);
  }
}

/*
 * Returns true if version is a semantic version. 
 */
Version.prototype.isSemantic = function() {
  return !!this.version.match(semanticPattern);
};

/*
 * Parses a semantic version into an object.
 */
Version.prototype.parseSemantic = function() {
  var match = this.version.match(semanticPattern);
  if (match.length === 4) {
    return {
      major: match[1],
      minor: match[2],
      patch: match[3]
    };
    return _.slice(match, 1);
  } else {
    return null;
  }
};

/*
 * Compares semantic version to see if they are equal, not equal, or only
 * differ by patch version.
 */
Version.compareSemantic = function(x, y) {
  x = x.parseSemantic();
  y = y.parseSemantic();
  assert.ok(x.major);
  assert.ok(x.minor);
  assert.ok(x.patch);
  assert.ok(y.major);
  assert.ok(y.minor);
  assert.ok(y.patch);
  var major = x.major === y.major;
  var minor = x.minor === y.minor;
  var patch = x.patch === y.patch;
  if (major && minor && patch) {
    return true;
  } else if (major && minor) {
    return 'patch';
  } else {
    return false;
  }
};

/*
 * Static method for comparing two versions.
 */
Version.compare = function(x, y) {
  if (x.isSemantic() && y.isSemantic()) {
    return Version.compareSemantic(x, y);
  } else {
    return x.version === y.version;
  }
  
};

/*
 * Compares version with another version.
 */
Version.prototype.compare = function(v) {
  return Version.compare(this, v);
};

/*
 * Return constructor as module.
 */
module.exports = Version;
