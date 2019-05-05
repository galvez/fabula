'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

const fs = require('fs');
const path = require('path');
const consola = _interopDefault(require('consola'));
const arg = _interopDefault(require('arg'));
require('lodash.merge');
require('util');
require('read');
require('ssh2');
require('./fabula-chunk.js');
require('module');
require('os');
require('lodash.template');
require('prompts');
const __chunk_2 = require('./fabula-chunk2.js');
require('child_process');
require('./fabula-chunk3.js');

function resolvePath(path$1) {
  return path.resolve(process.cwd(), ...path$1.split('/'))
}

function activeStreams() {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!__chunk_2.active) {
        resolve();
      } else {
        resolve(activeStreams());
      }
    }, 1);
  })
}

// const fabulaConfigHelper = () => {

// }

async function loadConfig(rcFile = null) {
  let config;
  if (rcFile === null) {
    for (rcFile of ['fabula.js', '.fabularc.js', '.fabularc']) {
      if (fs.existsSync(resolvePath(rcFile))) {
        config = require(resolvePath(rcFile));
        break
      }
      rcFile = null;
    }
  } else {
    config = require(rcFile);
  }
  if (rcFile === null) {
    consola.fatal('Fabula configuration file not found.');
    process.exit();
  }
  config = config.default || config;
  if (typeof config === 'function') {
    config = await config();
  }
  return config
}

function showHelpAndExit() {
  process.stdout.write(
    '\n' +
    '  Usage: fabula <server1,server2,...> <task> (run on specified servers)\n' +
    '         fabula all <task> (run on all servers)\n' +
    '         fabula <task> (run local only)\n\n'
  );
  process.exit();
}

function ensureSource(source) {
  if (!source.endsWith('.fab')) {
    source = `${source}.fab`;
  }
  if (!fs.existsSync(source)) {
    consola.fatal(`Task source doesn't exist: ${source}.`);
    process.exit();
  }
  return source
}

async function cli () {
  const args = arg({});
  if (args._.length === 0 || args._[0] === 'help') {
    showHelpAndExit();
  }
  const config = await loadConfig();
  if (args._.length === 2) {
    // Run on remote servers:
    // fabula <server1,server2,..> <script>
    // fabula all <script>
    const servers = args._[0].split(/,/g);
    const source = ensureSource(args._[1]);
    await __chunk_2.run(source, config, servers);
  } else if (args._.length === 1) {
    // Run strictly locally (non-local commands will cause an error)
    // fabula <local-script>
    const source = ensureSource(args._[0]);
    await __chunk_2.run(source, config);
  } else {
    showHelpAndExit();
  }
  if (typeof config.done === 'function') {
    await config.done();
  }

  await activeStreams();
  process.exit();
}

process.on('unhandledRejection', (err) => {
  consola.error(err);
});

exports.compile = __chunk_2.compile;
exports.parseArgv = __chunk_2.parseArgv;
exports.cli = cli;
exports.loadConfig = loadConfig;
