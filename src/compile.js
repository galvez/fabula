
import { readFileSync } from 'fs'
import { parse } from 'path'

import consola from 'consola'
import template from 'lodash.template'

import { requireFromString } from './node'
import { getConnection } from './ssh'

import Command from './command'
import commands from './commands'

compile.loadComponent = function (source) {
  source = source.split(/\n/g)
    .filter(line => !line.startsWith('#'))

  const fabula = []
  const script = []
  const strings = []

  let match
  let element
  let string = {}

  for (const line of source) {
    if (match = line.match(/^\s*<(?!\/)([^>]+)>/)) {
      element = match[1]
      if (match = element.match(/^string\s+id="([^"]+)"/)) {
        string = {id: match[1], lines: []}
        element = 'string'
      }
      continue
    } else if (match = line.match(/^\s*<\/([^>]+)>/)) {
      if (match[1] === 'string') {
        strings.push(string)
      }
      element = null      
      continue
    }
    switch (element) {
      case 'fabula':
        fabula.push(line)
        break
      case 'commands':
        script.push(line)
        break
      case 'string':
        string.lines.push(line)
        break
    }
  }
  return { fabula, script, strings }
}

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

function compileComponent(name, source, settings) {
  const { fabula, script, strings } = compile.loadComponent(source)
  const componentSettings = requireFromString(fabula.join('\n'), name)
  const componentSource = script.join('\n')
  const componentStrings = strings.reduce((hash, string) => {
    return { ...hash, [string.id]: string.lines.join('\n') }
  }, {})
  settings = {
    ...settings.options,
    ...componentSettings.default,
    strings: componentStrings
  }
  return compile(name, componentSource, settings)
}

export function compile(name, source, settings) {
  if (source.match(/^\s*<fabula>/g)) {
    return compileComponent(name, source, settings)
  }
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

export async function runLocalString(name, str, settings) {
  const commands = compile(name, str, settings)
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

export async function runString(server, conn, name, str, settings) {
  const commands = compile(name, str, settings)
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
  const name = parse(source).name
  source = readFileSync(source).toString()
  const settings = { ...config }
  delete settings.ssh

  let remoteServers = servers
  if (servers.length === 0) {
    await runLocalString(name, source, settings)
    return
  } else if (servers.length === 1 && servers[0] === 'all') {
    remoteServers = Object.keys(config.ssh)
  }

  let conn
  for (const server of remoteServers) {
    conn = await getConnection(config.ssh[server])
    await runString(server, conn, name, source, settings)
  }
}
