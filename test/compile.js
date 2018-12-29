import { parse } from 'path'
import { readFileSync, writeFileSync } from 'fs'
import { compile } from '../../src/index'

export async function compileForTest(source, config) {
  const name = parse(source).name
  source = readFileSync(source).toString()
  const commands = compile(name, source, {})
  return commands.map((cmd) => {
    return {
      source: cmd.source,
      params: cmd.params
    }
  })
}
