#!/usr/bin/env node
const readJson = require('read-package-json');
const commandLineArgs = require('command-line-args');
const cmd = require('node-cmd');

const optionDefinitions = [
 { name: 'package', alias: 'p', type: String }
];

const options = commandLineArgs(optionDefinitions);

if (!options.package) {
  throw new Error('Set the package.json path. For example, -p /path/package.json ');
}

let getDependencies = (deps) => {
  return Object.keys(deps).filter((k) => deps[k].indexOf('.tgz') !== -1).map((k) => ({key:k, value: deps[k]}));
}

readJson(options.package, console.error, false, function (er, json) {
  if (er) {
    console.error("There was an error reading the file");
    return;
  }

  let tgz = [...getDependencies(json.dependencies || {}), ...getDependencies(json.devDependencies || {})];

  tgz.forEach(({key, value}) => {
    cmd.get(`curl -s ${value}|shasum`,
      function(err, data, stderr){
          if (!err) {
            console.log(`${key}: ${data}`);
          } else {
             console.log('error', err)
          }
      }
  );
  });
});
