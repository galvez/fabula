
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
    consola.fatal('Fabula configuration not found.')
    process.exit()
  }
  return require(resolvePath(rcFile)).default
}

export default async function () {
  const config = loadConfig()
  const args = arg({})
  if (args._.length === 2) {
    // Run on remote servers:
    // fabula <server1,server2,..> <script>
    // fabula all <script>
    const servers = args._[0].split(/,/g)
    const source = args._[1]
    await run(source, config, servers)
  } else if (args._.length === 1) {
    // Run strictly locally (non-local commands will cause an error)
    // fabula <local-script>
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
