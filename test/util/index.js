import { readFileSync, writeFileSync } from 'fs'
import { compile } from '../../src/index'

export function runScriptTest(path) {
  const settings = require(`${path}.js`).default
  const shScript = readFileSync(`${path}.sh`).toString()
  const result = compile(shScript, settings).map((command) => {
    return [ command.source, command.params ]
  })
  writeFileSync(`${path}.result`, JSON.stringify(result, null, 2))
}
