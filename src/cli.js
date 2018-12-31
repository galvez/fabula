
import { existsSync } from 'fs'
import { resolve } from 'path'
import consola from 'consola'
import arg from 'arg'
import { run } from './run'

function resolvePath(path) {
  return resolve(process.cwd(), ...path.split('/'))
}

export function loadConfig(rcFile = null) {
  let config
  if (rcFile === null) {
    for (rcFile of ['fabula.js', '.fabularc.js', '.fabularc']) {
      if (existsSync(resolvePath(rcFile))) {
        config = require(resolvePath(rcFile))
        break
      }
      rcFile = null
    }
  } else {
    config = require(rcFile)
  }
  if (rcFile === null) {
    consola.fatal('Fabula configuration file not found.')
    process.exit()
  }
  return config.default || config
}

function showHelpAndExit() {
  process.stdout.write(
    '\n' +
    '  Usage: fabula <server1,server2,...> <task> (run on specified servers)\n' +
    '         fabula all <task> (run on all servers)\n' +
    '         fabula <task> (run local only)\n\n'
  )
  process.exit()
}

function ensureSource(source) {
  if (!source.endsWith('.fab')) {
    source = `${source}.fab`
  }
  if (!existsSync(source)) {
    consola.fatal(`Task source doesn't exist: ${source}.`)
    process.exit()
  }
  return source
}

export default async function () {
  const args = arg({})
  if (args._.length === 0 || args._[0] === 'help') {
    showHelpAndExit()
  }
  const config = loadConfig()
  if (args._.length === 2) {
    // Run on remote servers:
    // fabula <server1,server2,..> <script>
    // fabula all <script>
    const servers = args._[0].split(/,/g)
    const source = ensureSource(args._[1])
    await run(source, config, servers)
  } else if (args._.length === 1) {
    // Run strictly locally (non-local commands will cause an error)
    // fabula <local-script>
    const source = ensureSource(args._[0])
    await run(source, config)
  } else {
    showHelpAndExit()
  }
}

process.on('unhandledRejection', (err) => {
  consola.error(err)
})
