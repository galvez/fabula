'use strict';

require('fs');
require('path');
require('consola');
require('util');
require('read');
require('ssh2');
require('./fabula-chunk.js');
require('module');
require('lodash.template');
require('lodash.merge');
require('prompts');
const __chunk_2 = require('./fabula-chunk2.js');
require('child_process');
require('./fabula-chunk3.js');

const cd = {
  name: 'cd',
  patterns: {
    block: /^(?:local\s*)?cd\s+(.+?):\s*$/,
    global: /^(?:local\s*)?cd\s+([^ :]+?)\s*$/
  },
  match(line) {
    this.dedent = 0;
    if (this.argv[0] === 'cd') {
      let match;
      // eslint-disable-next-line no-cond-assign
      if (match = line.match(this.cmd.patterns.block)) {
        this.block = true;
        return match
      // eslint-disable-next-line no-cond-assign
      } else if (match = line.match(this.cmd.patterns.global)) {
        this.global = true;
        return match
      }
    }
  },
  line(line) {
    if (this.firstLine) {
      if (this.global) {
        this.settings.$cwd = this.match[1];
        return false
      } else {
        this.params.cwd = this.match[1];
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
    const settings = {
      ...this.settings,
      $cwd: resolve(
        this.settings.$cwd || process.cwd(),
        this.params.cwd
      )
    };
    const commands = this.params.commands.map((cmd) => {
      if (this.local && !/^\s+/.test(cmd)) {
        cmd = `local ${cmd}`;
      }
      return cmd
    }).join('\n');
    if (this.local) {
      await __chunk_2.runLocalSource(this.settings.$name, commands, settings, logger);
    } else {
      await __chunk_2.runSource(this.context.server, conn, this.settings.$name, commands, settings, logger);
    }
  }
};

exports.default = cd;
