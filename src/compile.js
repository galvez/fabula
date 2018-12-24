
import { readFileSync } from 'fs'
import consola from 'consola'

import template from 'lodash.template'

import { getConnection } from './ssh'

import Command from './command'
import commands from './commands'

compile.compileTemplate = function (cmd, settings) {
  const cmdTemplate = template(cmd, {
    interpolate: /<%=([\s\S]+?)%>/g
  })
  return cmdTemplate(settings)
}

compile.parseLine = function (command, line, push) {
  let cmd

  if (command) {
    if (command.handleLine(line)) {
      return command
    } else {
      command = null
    }
  }
  let match
  for (cmd of commands) {
    if (cmd.match) {
      command = new Command(cmd, line)
      match = command.cmd.match.call(command, line)
      if (match) {
        break
      }
    }
  }
  if (match) {
    command.match = match
  }
  if (command.handleLine(line)) {
    push(command)
    return command
  } else {
    push(command)
  }
}

compile.splitMultiLines = function (source) {
  let multiline
  return source.split(/\n/g).reduce((_lines, line) => {
    if (multiline) {
      line = line.trimLeft()
      multiline = /\\\s*$/.test(line)
      const index = _lines.length ? _lines.length - 1 : 0
      _lines[index] += line.replace(/\s*\\\s*$/, ' ')
      return _lines
    }
    multiline = /\\\s*$/.test(line)
    return _lines.concat([line.replace(/\s*\\\s*$/, ' ')])
  }, [])
}

export function compile(source, settings) {
  source = compile.compileTemplate(source, settings)

  const lines = compile.splitMultiLines(source)
    .filter(Boolean)
    .filter(line => !line.startsWith('#'))

  let currentCommand
  const parsedCommands = []

  for (const line of lines) {
    currentCommand = compile.parseLine(currentCommand, line, (command) => {
      parsedCommands.push(command)
    })
  }

  return parsedCommands
}

export async function runLocalString(str, settings) {
  const commands = compile(str, settings)
  for (const command of commands) {
    try {
      if (!command.local) {
        consola.info(`[FAIL]`, command.source[0])
        consola.fatal('No servers specified to run this remote command.')
        process.exit()
      }
      await command.run()
      consola.info(`[local] [OK]`, command.source[0])
    } catch (err) {
      consola.info(`[local] [FAIL]`, command.source[0])
      consola.fatal(err)
      break
    }
  }
}

export async function runString(server, conn, str, settings) {
  const commands = compile(str, settings)
  for (const command of commands) {
    try {
      await command.run(conn)
      consola.info(`[${server}] [OK]`, command.source[0])
    } catch (err) {
      consola.info(`[${server}] [FAIL]`, command.source[0])
      consola.fatal(err)
      break
    }
  }
}

export async function run(source, config, servers = []) {
  source = readFileSync(source).toString()
  const settings = { ...config }
  delete settings.ssh

  let remoteServers = servers
  if (servers.length === 0) {
    await runLocalString(source, settings)
    return
  } else if (servers.length === 1 && servers[0] === 'all') {
    remoteServers = Object.keys(config.ssh)
  }
  
  let conn
  for (const server of remoteServers) {
    conn = await getConnection(config.ssh[server])
    await runString(server, conn, source, settings)
  }
}
