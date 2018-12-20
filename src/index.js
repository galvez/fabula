
import { readFileSync } from 'fs'
import template from 'lodash.template'
import consola from 'consola'
import { getConnection } from './ssh'
import execCommand from './commands/exec'
import commands from './commands'

compile.compileTemplate = function(cmd, settings) {
  const cmdTemplate = template(cmd, {
    interpolate: /<%=([\s\S]+?)%>/g
  })
  return cmdTemplate(settings)
}

compile.expandTildes = (argv) => argv.map((arg) => {
  if (arg.startsWith('~')) {
    return `${process.env.HOME}${arg.slice(1)}`
  }
  return arg
})

compile.context = () => ({
  params: {},
  source: [],
  match: null,
  argv: []
})

export function compile(source, settings) {
  source = compile.compileTemplate(source, settings)

  const lines = source.split(/\n/g)
    .filter(Boolean)
    .filter((line) => !line.startsWith('#'))

  const _commands = []
  let command
  let match
  let ctx = compile.context()

  for (const line of lines) {
    ctx.line = line
    ctx.source.push(line)
    const next = () => {
      Object.assign(command, ctx)
      _commands.push(command)
      ctx = compile.context()
      command = null
    }
    if (command) {
      ctx.first = false
      command.line(ctx, next)
    } else {
      ctx.first = true
      ctx.argv = compile.expandTildes(line.split(/\s+/))
      command = commands.find((cmd) => {
        match = cmd.match(ctx, line)
        if (match) {
          ctx.match = match
          return true
        }
      })
      if (command) {
        command = { ...command }
        command.line(ctx, next)
      } else {
        _commands.push({
          ...execCommand,
          source: ctx.source,
          argv: ctx.argv
        })
        ctx = compile.context()
        command = null
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
  const commands = compile(str, settings)
  for (const command of commands) {
    consola.info('Running command:', command.source[0], command.params)
    // await command()
  }  
}
