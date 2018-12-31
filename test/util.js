import { parse } from 'path'
import { readFileSync, writeFileSync } from 'fs'
import { compile } from '../src/compile'
export { loadConfig } from '../src/cli'
export { parseArgv } from '../src/command'

export function compileForTest(source, config) {
  const name = parse(source).name
  if (!source.endsWith('.fab')) {
    source += '.fab'
  }
  source = readFileSync(source).toString()
  return compile(name, source, config)
}
