'use strict';

require('fs');
require('consola');
require('util');
require('read');
require('ssh2');
const __chunk_1 = require('./fabula-chunk.js');

const get = {
  match(line) {
    return line.trim().match(/^get\s+(.+)\s+(.+)/)
  },
  line() {
    this.params.sourcePath = this.match[1];
    this.params.targetPath = this.match[2];
  },
  command(conn) {
    return __chunk_1.get(conn, this.params.sourcePath, this.param.targetPath)
  }
};

exports.default = get;
