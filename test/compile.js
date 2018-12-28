import { readFileSync, writeFileSync } from 'fs'
import { compile } from '../../src/index'

export function runScriptTest(path) {
  const settings = require(`${path}.js`).default
  const shScript = readFileSync(`${path}.sh`).toString()
  const commands = compile(shScript, settings)
  const result = commands.map((command) => command.argv)
  writeFileSync(`${path}.result`, JSON.stringify(result, null, 2))
  return result
}
