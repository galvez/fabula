
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
  for (rcFile of ['fabula.js', '.fabularc.js', '.fabularc']) {
    if (existsSync(resolvePath(rcFile))) {
      break
    }
    rcFile = null
  }
  if (rcFile === null) {
    consola.fatal('Fabula configuration file not found.')
    process.exit()
  }
  return require(resolvePath(rcFile)).default
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

export default async function () {
  const args = arg({})
  if (args._.length == 0 || args._[0] === 'help') {
    showHelpAndExit()
  }
  const config = loadConfig()
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
    if (!existsSync(source)) {
      consola.fatal('Task source doesn\'t exist.')
      process.exit()
    }
    await run(source, config)
  } else {
    showHelpAndExit()
  }
}
