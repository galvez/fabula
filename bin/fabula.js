#!/usr/bin/env node

require = require('esm')(module)
const consola = require('consola')

require('fabula').cli()
  // @pi0 If I don't place then() here it hangs
  // Let me know if you have an elegant workaround
  .then(() => process.exit(0))
  .catch((err) => {
    consola.fatal(err)
    process.exit(1)
  })
