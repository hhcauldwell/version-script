#!/usr/bin/env node

// Nodejs modules.
var util = require('util');

// Npm modules.
var Promise = require('bluebird');
var yargs = require('yargs');
var _ = require('lodash');
var chalk = require('chalk');
var dateFormat = require('date-format');

// Get command line arguments and options.
var argv = yargs.argv;

// Load languages module.
var languages = require('./lib/languages.js');

// Load images module.
var images = require('./lib/images.js');

// Init number of total languages being checked.
var totalChecks = 0;

// Init number of total languages that have failed results.
var failedChecks = 0;

// Get list of all languages.
languages.getAll()
// Filter based on command line args.
.filter(function(language) {
  var search = argv._[0];
  if (search) {
    return _.startsWith(language.id, search);
  } else {
    return true;
  }
})
// Set total number of checks.
.tap(function(languages) {
  totalChecks = languages.length;
})
// Iterate in series over each language.
.mapSeries(function(language) {
  // Start.
  console.log('\nChecking ' + language.id);
  // Get image object.
  return images.get(language.id)
  .then(function(image) {
    // Get image and language versions.
    return Promise.join(image.version(), language.version(),
    function(imageVersion, languageVersion) {
      // Compare image version vs language version.
      var compareResult = imageVersion.compare(languageVersion);
      console.log('image version:    ' + imageVersion.version);
      console.log('language version: ' + languageVersion.version);
      console.log('image updated:    '
        + dateFormat('yyyy/MM/dd', imageVersion.updated));
      console.log('language updated: '
        + dateFormat('yyyy/MM/dd', languageVersion.updated));
      if (compareResult === true) {
        // OK exact match.
        console.log(chalk.green('Status:           OK'));
      } else if (compareResult === 'patch') {
        // OK but patch version differs.
        console.log(chalk.yellow('Status:           OK'));
      } else {
        // Failure not a match.
        failedChecks += 1;
        console.log(chalk.red('Status:           Failed'));
      }
    });
  })
  // Handle errors.
  .catch(function(err) {
    failedChecks += 1;
    console.log(chalk.red('ERR: ' + err.message));
    console.log(chalk.red('ERR: ' + err.stack));
  });
})
// Report results.
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
  // Exit the process.
  process.exit(failedChecks);
});
