import { parse } from 'path'
import { readFileSync, writeFileSync } from 'fs'
import { compile } from '../dist/fabula'
export { loadConfig } from '../dist/fabula'
export { parseArgv } from '../dist/fabula'

export function compileForTest(source, config) {
  const name = parse(source).name
  if (!source.endsWith('.fab')) {
    source += '.fab'
  }
  source = readFileSync(source).toString()
  return compile(name, source, config)
}
