
import { readFileSync } from 'fs'
import template from 'lodash.template'
import consola from 'consola'

import { getConnection } from './ssh'

import Command from './command'
import commands from './commands'
import execCommand from './commands/exec'

compile.compileTemplate = function(cmd, settings) {
  const cmdTemplate = template(cmd, {
    interpolate: /<%=([\s\S]+?)%>/g
  })
  return cmdTemplate(settings)
}

compile.matchCommand = function(command, line) {
  let cmd
  let match

  if (command) {
    this.firstLine = false
    if (!command.firstLine && !command.handleLine(line)) {
      return command
    }
  }
  for (cmd of commands) {
    if (cmd.match) {
      command = new Command(cmd, line)
      match = command.cmd.match.call(command, line)
    }
  }
  if (match) {
    command.match = match
  } else {
    command = new Command(execCommand, line)
  }
  command.handleLine(line)
  return command
}

export function compile(source, settings) {
  source = compile.compileTemplate(source, settings)

  const lines = source.split(/\n/g)
    .filter(Boolean)
    .filter(line => !line.startsWith('#'))

  let lastCommand
  let currentCommand
  const parsedCommands = []

  for (const line of lines) {
    currentCommand = compile.matchCommand(currentCommand, line)
    lastCommand = parsedCommands[parsedCommands.length ? parsedCommands.length - 1 : 0]
    if (currentCommand !== lastCommand) {
      parsedCommands.push(currentCommand)
    }
  }
  console.log(parsedCommands)
  return parsedCommands
}

// export async function run(config, task) {
//   const base = config.srcDir
//   const servers = (config.ops || {}).servers || {}
//   task = readFileSync(base, 'tasks', task)

//   for (const server in servers) {
//     const conn = getConnection(server, servers[server])
//     const template = compileTemplate(task, servers[server])
//     const tree = compileTree(template)
//     const commands = commandsFromTree(tree)
//     for (const command of commands) {
//       consola.info('Running command:', command.meta)
//       await command()
//     }
//   }
//   if (servers.length === 0) {
//     consola.warn('No servers configured.')
//   }
// }

// Mostly temporary, for testing
export async function runString(settings, str) {
  const commands = compile(str, settings)
  for (const command of commands) {
    consola.info('Running command:', command.source[0], command.params)
    // await command()
  }
}
