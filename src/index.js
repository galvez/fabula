
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

compile.matchCommand = function(ctx, line) {
  let match
  return commands.find((cmd) => {
    match = cmd.match(ctx, line)
    if (match) {
      ctx.$match = match
      return true
    }
  })
}

compile.context = () => ({
  params: {},
  source: [],
  $match: null,
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
    const next = (add = true) => {
      if (add) {
        Object.assign(command, ctx)
        _commands.push(command)
        ctx = compile.context()
        command = null
      } else {
        Object.assign(command, ctx)
        _commands.push(command)
        console.log('>', line)
        ctx = compile.context()
        ctx.first = true
        command = compile.matchCommand(ctx, line)
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
    if (command) {
      ctx.first = false
      ctx.source.push(line)
      command.line(ctx, next)
    } else {
      ctx.first = true
      ctx.argv = compile.expandTildes(line.split(/\s+/))
      command = compile.matchCommand(ctx, line)
      // console.log(ctx, line, command)
      if (command) {
        ctx.source.push(line)
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
