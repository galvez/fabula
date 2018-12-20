
import { readFileSync } from 'fs'
import template from 'lodash.template'
import consola from 'consola'
import { getConnection } from './ssh'
import { commands } from './commands'

export function compileTemplate(cmd, settings) {
  const cmdTemplate = template(cmd, {
    interpolate: /<%=([\s\S]+?)%>/g
  })
  return cmdTemplate(settings)
}

export function compileTree(source) {
  const lines = cmd.split(/\n/g)
  const commands = []

  let command
  let match

  const ctx = {
    cmd: null,
    match: null,
    argv: []
  }

  for (const line of lines) {
    ctx.argv = line.split(/s+/)
    if (command) {
      command.line(ctx, () => {
        cmd = null
      })
    } else {    
      command = commands.find((cmd) => {
        match = cmd.match(ctx, line)
        if (match) {
          return true
        }
      })
      if (command) {
        command = { ...command }
      }
    }
  }
  return commands
}

function makeCommand(command, method) {
  const func = () => method(command)
  func.meta = command
  return func
}

export function commandsFromTree(commands) {
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
    const tree = compileTree(template)
    const commands = commandsFromTree(tree)
    for (const command of commands) {
      consola.info('Running command:', command.meta)
      await command()
    }
  }
  if (servers.length === 0) {
    consola.warn('No servers configured.')
  }
}

// Mostly temporary, for testing
export async function runString(conn, str) {
  const template = compileTemplate(task, servers[server])
  const tree = compileTree(template)
  const commands = commandsFromTree(tree)
  for (const command of commands) {
    consola.info('Running command:', command.meta)
    await command()
  }  
}
