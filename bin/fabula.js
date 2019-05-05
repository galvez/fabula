#!/usr/bin/env node

const consola = require('consola')

try {
  require('esm')(module)('../dist/fabula')
    .cli().catch((err) => {
      consola.fatal(err)
      process.exit(1)
    })
} catch (err) {
  consola.fatal(err)
  process.exit(1)
}
