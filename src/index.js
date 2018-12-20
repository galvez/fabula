
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

compile.context = () => ({
  args: [],
  cmd: null,
  match: null,
  argv: []
})

export function compile(source) {
  const lines = source.split(/\n/g)
  const _commands = []

  let command
  let match

  let ctx = compile.context()

  for (const line of lines) {
    ctx.line = line
    if (command) {
      ctx.first = false
      command.line(ctx, () => {
        command.ctx = ctx
        _commands.push(command)
        ctx = compile.context()
        command = null
      })
    } else {    
      command = commands.find((cmd) => {
        match = cmd.match(line, ctx)
        if (match) {
          ctx.argv = line.split(/\s+/)
          ctx.match = match
          ctx.first = true
          return true
        }
      })
      if (command) {
        command = { ...command }
      }
    }
  }
  return _commands
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
export async function runString(settings, str) {
  const template = compileTemplate(str, settings)
  const commands = compile(template)
  console.log(commands[0])
  // for (const command of commands) {
  //   consola.info('Running command:', command.name, command.args)
  //   await command()
  // }  
}
