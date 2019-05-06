'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

require('fs');
require('path');
require('consola');
const merge = _interopDefault(require('lodash.merge'));
require('util');
require('read');
require('ssh2');
const __chunk_1 = require('./fabula-chunk.js');
require('module');
require('os');
require('lodash.template');
require('prompts');
const __chunk_2 = require('./fabula-chunk2.js');
require('child_process');
const __chunk_3 = require('./fabula-chunk3.js');

const handle = {
  name: 'handle',
  patterns: {
    block: /^(?:local\s*)?(.+?)\s*@([\w\d_]+):\s*$/,
    global: /^(?:local\s*)?(.+?)\s*@([\w\d_]+)\s*$/
  },
  match(line) {
    this.dedent = 0;
    let match;
    // eslint-disable-next-line no-cond-assign
    if (match = line.match(this.cmd.patterns.block)) {
      this.block = true;
      this.params.cmd = match[1];
      this.handler = match[2];
      return match
    // eslint-disable-next-line no-cond-assign
    } else if (match = line.match(this.cmd.patterns.global)) {
      this.global = true;
      this.params.cmd = match[1];
      this.handler = match[2];
      return match
    }
  },
  line(line) {
    if (this.firstLine) {
      if (this.global) {
        return false
      } else {
        this.params.commands = [];
        return true
      }
    } else if (!/^\s+/.test(line)) {
      return false
    } else {
      if (this.params.commands.length === 0) {
        const match = line.match(/^\s+/);
        if (match) {
          this.dedent = match[0].length;
        }
      }
      this.params.commands.push(line.slice(this.dedent));
      return true
    }
  },
  async command(conn, logger) {
    let settings = { ...this.settings };
    // const commands = this.params.commands.map((cmd) => {
    //   if (this.local && !/^\s+/.test(cmd)) {
    //     cmd = `local ${cmd}`
    //   }
    //   return cmd
    // }).join('\n')
    let result;
    if (this.local) {
      result = await __chunk_3.execLocal([this.argv[0], this.argv.slice(1)], this.env, this.settings.$cwd);
    } else {
      result = await __chunk_1.exec(conn, this.params.cmd, this.env, this.settings.$cwd);
    }
    let abort = false;
    const fabula = {
      prompt: __chunk_2.prompt,
      abort: () => {
        abort = true;
      }
    };
    if (this.handler && this.settings[this.handler]) {
      merge(settings, await this.settings[this.handler](result, fabula));
    }
    if (abort) {
      return false
    }
    const commands = this.params.commands.join('\n');
    if (this.context.server) {
      await __chunk_2.runSource(this.context.server, conn, this.settings.$name, commands, settings, logger);
    } else {
      await __chunk_2.runLocalSource(this.settings.$name, commands, settings, logger);
    } 
  }
};

exports.default = handle;
