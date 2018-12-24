
import { existsSync } from 'fs'
import { resolve } from 'path'
import consola from 'consola'
import arg from 'arg'
import { runSource } from './compile'
// import { getConnection } from './ssh'

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
  return require(resolvePath(rcFile))
}

export default async function () {
  const config = loadConfig()
  const args = arg({})
  const source = args._[0]
  if (!source) {
    throw new Error('No action specified.')
  }
  await runSource(source, config)
}
