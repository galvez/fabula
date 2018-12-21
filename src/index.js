
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

compile.matchCommand = function(line) {
  let match
  let command
  for (const cmd of commands) {
    match = cmd.match(line)
    if (match) {
      return new Command(cmd, match, line)
    }
  }
}

export function compile(source, settings) {
  source = compile.compileTemplate(source, settings)

  const lines = source.split(/\n/g)
    .filter(Boolean)
    .filter((line) => !line.startsWith('#'))

  let currentCommand
  const parsedCommands = []

  for (const line of lines) {

    const next = (add = true) => {
      if (add) {
        parsedCommands.push(currentCommand)
        currentCommand = null
      } else {
        parsedCommands.push(currentCommand)
        currentCommand = compile.matchCommand(ctx, line, next)
        if (currentCommand) {
          parsedCommands.push(currentCommand)
        }
        currentCommand = null
      }
    }

    if (currentCommand) {
      currentCommand.handleLine(line, next)
    } else {
      currentCommand = compile.matchCommand(line, next)
      if (currentCommand) {
        parsedCommands.push(currentCommand)
      }
    }
  }
  return _commands
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
