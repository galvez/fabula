import Module from 'module'
import path from 'path'

export function requireFromString(code, name) {
  const m = new Module()
  m._compile(code, `components/${name}.js`)
  m.loaded = true
  return m.exports
}


// // Adapted from https://github.com/floatdrop/require-from-string

// export function requireFromString(code, filename, opts) {
//   if (typeof filename === 'object') {
//     opts = filename
//     filename = undefined
//   }

//   opts = opts || {}
//   filename = filename || ''
//   opts.appendPaths = opts.appendPaths || []
//   opts.prependPaths = opts.prependPaths || []

//   if (typeof code !== 'string') {
//     consola.fatal(`requireFromString: code must be a string, not ${typeof code}`)
//     process.exit()
//   }

//   const paths = Module._nodeModulePaths(path.dirname(filename))

//   const parent = module.parent
//   const m = new Module(filename, parent)
//   m.filename = filename
//   m.paths = [ ...opts.prependPaths, ...paths, ...opts.appendPaths ]
//   m._compile(code, filename)

//   const exports = m.exports

//   if (parent && parent.children) {
//     parent.children.splice(parent.children.indexOf(m), 1)
//   }

//   return exports
// }
