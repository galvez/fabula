'use strict';

require('fs');
require('consola');
require('util');
require('read');
require('ssh2');
const __chunk_1 = require('./fabula-chunk.js');
require('child_process');
const __chunk_3 = require('./fabula-chunk3.js');

const write = {
  patterns: {
    block: (argv) => {
      return new RegExp(`^(?:local\\s*)?${argv[0]}\\s+(.+?):$`)
    },
    string: (argv) => {
      return new RegExp(`^(?:local\\s*)?${argv[0]}\\s+([^ ]+?)\\s+([^ :]+?)$`)
    }
  },
  match(line) {
    this.op = this.argv[0];
    this.dedent = 0;
    if (['append', 'write'].includes(this.argv[0])) {
      let match;
      // eslint-disable-next-line no-cond-assign
      if (match = line.match(this.cmd.patterns.block(this.argv))) {
        this.block = true;
        return match
      // eslint-disable-next-line no-cond-assign
      } else if (match = line.match(this.cmd.patterns.string(this.argv))) {
        this.string = true;
        return match
      }
    }
  },
  line(line) {
    if (this.firstLine) {
      this.params.filePath = this.match[1];
      this.params.fileContents = [];
      if (this.string) {
        const settingsKey = this.match[2];
        this.params.fileContents = () => {
          // If it's a variable, return raw value
          if (settingsKey.startsWith('vars.')) {
            // eslint-disable-next-line no-eval
            return eval(`this.settings.${settingsKey}`)
          // Treat everything else as a string
          } else {
            // eslint-disable-next-line no-eval
            return eval(`this.settings.${settingsKey}`).split(/\n/g)
          }
        };
        return false
      } else {
        return true
      }
    } else if (!/^\s+/.test(line)) {
      return false
    } else {
      if (this.params.fileContents.length === 0) {
        const match = line.match(/^\s+/);
        if (match) {
          this.dedent = match[0].length;
        }
      }
      this.params.fileContents.push(line.slice(this.dedent));
      return true
    }
  },
  command(conn) {
    const filePath = this.params.filePath;
    const fileContents = typeof this.params.fileContents === 'function'
      ? this.params.fileContents()
      : this.params.fileContents.join('\n');
    if (this.local) {
      const cmd = ({ write: __chunk_3.localWrite, append: __chunk_3.localAppend })[this.op];
      return cmd(filePath, fileContents)
    } else {
      return ({ write: __chunk_1.write, append: __chunk_1.append })[this.op](conn, filePath, fileContents)
    }
  }
};

exports.default = write;
