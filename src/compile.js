
import Module from 'module'
import { readFileSync } from 'fs'
import { parse } from 'path'

import consola from 'consola'
import template from 'lodash.template'
import defaultsDeep from 'lodash.defaultsdeep'

import Command from './command'
import execCommand from './commands/exec'
import commands from './commands'
import { getConnection } from './ssh'
import { quote } from './utils'

function requireFromString(code, name) {
  const m = new Module()
  // Second parameter is here is a virtual unique path
  m._compile(code, `components/${name}.js`)
  m.loaded = true
  return m.exports
}

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
    // eslint-disable-next-line no-cond-assign
    if (match = line.match(/^\s*<(?!\/)([^>]+)>/)) {
      element = match[1].split(/\s+/g)
      // eslint-disable-next-line no-cond-assign
      if (match = match[1].match(/^string\s+id="([^"]+)"/)) {
        string = { id: match[1], lines: [] }
        element = ['string']
      }
      continue
    // eslint-disable-next-line no-cond-assign
    } else if (match = line.match(/^\s*<\/([^>]+)>/)) {
      if (match[1] === 'string') {
        strings.push(string)
      }
      element = null
      continue
    }
    switch (element[0]) {
      case 'fabula':
        if (element.length > 1) {
          fabula.push(`${element.slice(1).join(' ')} ${line}`)
        } else {
          fabula.push(line)
        }
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
    imports: { quote },
    interpolate: /<%=([\s\S]+?)%>/g
  })
  return cmdTemplate(settings)
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

compile.parseLine = function (command, line, settings, env, push) {
  let cmd

  if (command) {
    if (command.handleLine(line)) {
      return command
    } else {
      command = null
    }
  }
  let match
  const commandSearchList = [...commands]
  if (settings.commands) {
    commandSearchList.push(...settings.commands)
    delete settings.commands
  }
  commandSearchList.push(execCommand)
  for (cmd of commandSearchList) {
    if (cmd.match) {
      command = new Command(cmd, line, env)
      command.settings = settings
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

function compileComponent(name, source, settings) {
  const { fabula, script, strings } = compile.loadComponent(source)
  const componentSource = script.join('\n')

  const componentSettings = {
    ...requireFromString(fabula.join('\n'), name).default
  }

  const globalEnv = { ...settings.env }
  delete globalEnv.local
  delete globalEnv.ssh

  const env = {
    ...globalEnv,
    ...componentSettings.env
  }
  delete componentSettings.env

  // Can't override any of these from a component
  delete componentSettings.agent
  delete componentSettings.ssh

  settings = defaultsDeep({}, settings, componentSettings)

  settings.strings = strings.reduce((hash, string) => {
    const compiledString = compile.compileTemplate(string.lines.join('\n'), settings)
    return { ...hash, [string.id]: quote(compiledString, true) }
  }, {})

  return compile(name, componentSource, settings, env)
}

export function compile(name, source, settings, env = {}) {
  // If <fabula> or at least <commands> is detected,
  // process as a component and return
  if (source.match(/^\s*<(?:(?:fabula)|(commands))>/g)) {
    return compileComponent(name, source, settings)
  }

  // If no marked section is found, proceed to
  // regular commands compilation
  source = compile.compileTemplate(source, settings)

  // splitMultiLines() will merge lines ending in `\`
  // with the subsequent one, preserving Bash's behaviour
  const lines = compile.splitMultiLines(source)
    .filter(Boolean)
    .filter(line => !line.startsWith('#'))

  let currentCommand
  const parsedCommands = []

  for (const line of lines) {
    // If a component's line() handler returns true,
    // the same command object will be returned, allowing
    // parsing of custom mult-line special commands
    currentCommand = compile.parseLine(currentCommand, line, settings, env, (command) => {
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
      const response = await command.run()
      if (response) {
        if (response.stdout) {
          for (const line of response.stdout.split(/\n/g).filter(Boolean)) {
            consola.info('[local]', line.trim())
          }
        }
        if (response.stderr) {
          for (const line of response.stderr.trim().split(/\n/g).filter(Boolean)) {
            consola.error('[local]', line.trim())
          }
        }
      }
      consola.info(`[local] [OK]`, command.source[0])
    } catch (err) {
      consola.info(`[local] [FAIL]`, command.source[0])
      consola.fatal(err)
      break
    }
  }
}

export async function runString(server, conn, name, str, settings) {
  settings = {
    ...settings,
    $server: conn.settings
  }
  const commands = compile(name, str, settings)
  for (const command of commands) {
    try {
      const response = await command.run(conn)
      if (response) {
        if (response.stdout) {
          for (const line of response.stdout.split(/\n/g).filter(Boolean)) {
            consola.info(`[${server}]`, line.trim())
          }
        }
        if (response.stderr) {
          for (const line of response.stderr.trim().split(/\n/g).filter(Boolean)) {
            consola.error(`[${server}]`, line.trim())
          }
        }
      }
      consola.info(`[${server}] [OK]`, command.source[0])
    } catch (err) {
      consola.error(`[${server}] [FAIL]`, command.source[0])
      consola.fatal(err)
      break
    }
  }
}

export async function run(source, config, servers = []) {
  const name = parse(source).name
  source = readFileSync(source).toString()
  const settings = { ...config }

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
