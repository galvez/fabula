
import { existsSync } from 'fs'
import { resolve } from 'path'
import consola from 'consola'
import arg from 'arg'
import { run } from './compile'

function resolvePath(path) {
  return resolve(process.cwd(), ...path.split('/'))
}

function loadConfig() {
  let rcFile
  for (rcFile of ['.fabularc', '.fabularc.js', 'fabula.js']) {
    if (existsSync(resolvePath(rcFile))) {
      break
    }
    rcFile = null
  }
  if (rcFile === null) {
    throw new Error('Fabula configuration not found.')
  }
  return require(resolvePath(rcFile)).default
}

export default async function () {
  const config = loadConfig()
  const args = arg({})
  if (args._.length === 2) {
    const servers = args._[0].split(/,/g)
    const source = args._[1]
    await run(source, config, servers)
  } else if (args._.length === 1) {
    const source = args._[0]
    if (!source) {
      consola.fatal('No source specified.')
      process.exit()
    }
    await run(source, config)
  } else {
    consola.fatal('Unrecognized number of parameters.')
    process.exit()
  }
}
