#!/usr/bin/env node

const consola = require('consola')

try {
  require('../dist/fabula').cli()
} catch (err) {
  consola.fatal(err)
  process.exit(1)
}

