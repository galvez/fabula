
import template from 'lodash.template'
import { readFileSync } from 'fs'
import consola from 'consola'
import {
  getConnection,
  runLocalCommand,
  runCommand,
  runPut,
  runEcho
} from './ssh'

function compileTemplate(cmd, settings) {
  const cmdTemplate = template(cmd, {
    interpolate: /<%=([\s\S]+?)%>/g
  })
  return cmdTemplate(settings)
}

function compileAST(cmd) {
  cmd = cmd.toString()
  const lines = cmd.split(/\n/g)
  const commands = []
  let match
  let echoIndex
  let echo = false
  for (const line of lines) {
    const parts = line.split(/s+/)
    if (echo) {
      if (!/^\s+/.test(line)) {
        echo = false
      } else {
        if (!commands[echoIndex][2]) {
          commands[echoIndex][2] = []
        }
        commands[echoIndex][2].push(line)
      }
    } else if (line.startsWith('local')) {
      commands.push(['local', parts.slice(1).join(' ')])
    } else if (line.startsWith('put')) {
      commands.push(['put', parts.slice(1)])
    // eslint-disable-next-line no-cond-assign
    } else if (match = line.trim().match(/^echo\s+(.+?):$/)) {
      commands.push(['echo', match[1]])
      echoIndex = commands.length - 1
      echo = true
    } else if (line.trim().length > 0) {
      commands.push(line)
    }
  }
  return commands
}

function makeCommand(command, method) {
  const func = () => method(command)
  func.meta = command
  return func
}

function commandsFromAST(commands) { 
  return commands.map((command) => {
    if (Array.isArray(command)) {
      if (command[0] === 'local') {
        return makeCommand(command[1], runLocalCommand)
      } else if (command[0] === 'echo') {
        return makeCommand(command.slice(1), runEcho)
      } else if (command[0] === 'put') {
        return makeCommand(command, runPut)
      }
    } else {
      return makeCommand(command, runCommand)
    }
  })
}

export async function run(config, task) {
  const base = config.srcDir
  const servers = (config.ops || {}).servers || {}
  task = readFileSync(base, 'tasks', task)

  for (const server in servers) {
    const conn = getConnection(server, servers[server])
    const template = compileTemplate(task, servers[server])
    const tree = compileAST(template)
    const commands = commandsFromAST(tree)
    for (const command of commands) {
      consola.info('Running command:', command.meta)
      await command()
    }
  }
  if (servers.length === 0) {
    consola.warn('No servers configured.')
  }
}

// const sampleSettings = {
//   hostname: 'my-server',
//   host: '192.168.100.100',
//   port: 22,
//   username: 'username',
//   privateKey: '/here/is/my/key'
// }

// if (require.main === module) {
//   const template = compileTemplate(readFileSync('test/fixtures/setup-ssh.sh'), sampleSettings)
//   const tree = compileAST(template)
//   console.log('AST:')
//   console.log(tree)
//   const commands = commandsFromAST(tree)
//   console.log()
//   console.log('Command tree:')
//   console.log(commands.map(cmd => cmd.toString()))
// }
