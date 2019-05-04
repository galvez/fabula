'use strict';

const fs = require('fs');
require('path');
require('consola');
require('util');
require('read');
require('ssh2');
require('./fabula-chunk.js');
require('module');
require('lodash.template');
require('lodash.merge');
const __chunk_2 = require('./fabula-chunk2.js');
require('child_process');
require('./fabula-chunk3.js');

const fabula = {
  match(line) {
    this.dedent = 0;
    let match;
    // eslint-disable-next-line no-cond-assign
    if (match = line.match(/^fabula\s+\.\s+([^ ]+?)\s*$/)) {
      this.params.filePath = this.match[1];
      return match
    }
  },
  async command(conn, logger) {
    const settings = {
      ...this.settings,
      fail: true
    };
    const commands = fs.readFile(this.params.filePath).toString();
    if (this.local) {
      await __chunk_2.runLocalSource(this.settings.$name, commands, settings, logger);
    } else {
      await __chunk_2.runSource(this.context.server, conn, this.settings.$name, commands, settings, logger);
    }
  }
};

exports.default = fabula;