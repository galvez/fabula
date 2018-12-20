
import { readFileSync } from 'fs'
import template from 'lodash.template'
import consola from 'consola'
import { getConnection } from './ssh'
import { commands } from './commands'

compile.compileTemplate = function(cmd, settings) {
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

export function compile(source, settings) {
  source = compile.compileTemplate(source, settings)
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
  console.log(commands[0].run, commands[0].ctx.args)
  // for (const command of commands) {
  //   consola.info('Running command:', command.name, command.args)
  //   await command()
  // }  
}
