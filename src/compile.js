import { readFileSync } from 'fs'
import consola from 'consola'

import template from 'lodash.template'

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

  console.log('>', lines)

  for (const line of lines) {
    currentCommand = compile.parseLine(currentCommand, line, (command) => {
      parsedCommands.push(command)
    })
  }

  return parsedCommands
}

export async function runString(str, settings) {
  const commands = compile(str, settings)
  for (const command of commands) {
    console.log(command.source)
    // try {
    //   await command.run()
    //   consola.info(command.source[0], '[OK]')
    // } catch (err) {
    //   consola.info(command.source[0], '[FAIL]')
    //   consola.fatal(err)
    // }
  }
}

export function runSource(source, settings) {
  source = readFileSync(source).toString()
  runString(source, settings)
}
