
import { resolve } from 'path'
import arg from 'arg'
import { runSource } from '../compile'

function resolvePath(path, base = null) {
  if (!base) {
    base = process.cwd()
  }
  return resolve(base, ...path.split('/'))
}

function loadServers() {
  for (const rcFile in ['.fabularc', '.fabularc.js', 'fabula.js']) {
    if (existsSync(rcFile))
  }
}

void function main() {
  const args = arg()
  const source = args._[0]


}()
