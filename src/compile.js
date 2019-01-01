
import Module from 'module'

import consola from 'consola'
import template from 'lodash.template'
import defaultsDeep from 'lodash.defaultsdeep'

import Command from './command'
import execCommand from './commands/exec'
import commands from './commands'
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
  let prepend

  for (const line of source) {
    // eslint-disable-next-line
    if (match = line.match(/^\s*<([^\/%][^>]+)>/)) {
      element = match[1].split(/\s+/g)
      prepend = element.slice(1).join(' ')
      element = element[0]
      // eslint-disable-next-line no-cond-assign
      if (match = match[1].match(/^string\s+id="([^"]+)"/)) {
        string = { id: match[1], lines: [] }
        element = 'string'
      }
      continue
    // eslint-disable-next-line no-cond-assign
    } else if (match = line.match(/^\s*<\/([^>]+)>/)) {
      if (match[1] === 'string') {
        strings.push(string)
      }
      element = null
    }
    if (!element) {
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
  return { fabula, script, strings, prepend }
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

compile.parseLine = function (command, line, prepend, settings, env, push) {
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
      let _line = line
      if (prepend && !/^\s+/.test(line)) {
        _line = command.prepend(prepend, line)
      }
      match = command.cmd.match.call(command, _line)
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
  const { fabula, script, strings, prepend } = compile.loadComponent(source)
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

  return compile(name, componentSource, settings, prepend, env)
}

export function compile(name, source, settings, prepend, env = {}) {
  // If <fabula> or at least <commands> is detected,
  // process as a component and return
  if (source.match(/^\s*<(?:(?:fabula)|(commands))[^>]*>/g)) {
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
    currentCommand = compile.parseLine(currentCommand, line, prepend, settings, env, (command) => {
      parsedCommands.push(command)
    })
  }

  return parsedCommands
}
