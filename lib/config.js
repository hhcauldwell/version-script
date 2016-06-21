'use strict';

// Nodejs modules.
var path = require('path');

// Npm modules.
var yaml = require('yamljs');
var _ = require('lodash');
var VError = require('verror');

// Load config yaml file into a json object.
var load = _.once(function() {
  var configFilepath = path.resolve('./config.yml');
  try {
    return yaml.load(configFilepath);
  } catch(err) {
    throw new VError(err, 'Error loading config file: ' + configFilepath);
  }
});

/*
 * Return api.
 */
module.exports = {
  load: load
};
