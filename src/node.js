import Module from 'module'
import path from 'path'

export function requireFromString(code, name) {
  const m = new Module()
  m._compile(code, `components/${name}.js`)
  m.loaded = true
  return m.exports
}
