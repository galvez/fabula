#!/usr/bin/env node

require = require('esm')(module)
const consola = require('consola')

require('fabula').cli()
  .catch((err) => {
    consola.fatal(err)
    process.exit()
  })
