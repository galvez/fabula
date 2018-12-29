import { parse } from 'path'
import { readFileSync, writeFileSync } from 'fs'
import { compile } from '../src/compile'

export function compileForTest(source, config) {
  const name = parse(source).name
  if (!source.endsWith('.fab')) {
    source += '.fab'
  }
  source = readFileSync(source).toString()
  const commands = compile(name, source, {})
  return commands.map((cmd) => {
    return {
      source: cmd.source,
      params: cmd.params
    }
  })
}
