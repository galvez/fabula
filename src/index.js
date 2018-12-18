
import consola from 'consola'
import { runCommand } from './ssh'

// import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
// import { join, resolve, parse } from 'path'
// import klawSync from 'klaw-sync'
// import defaults from './defaults'

const resolvePath = (base, ...args) => resolve(base, ...args)

export function run (config, task) {
  const base = config.srcDir
  const servers = (ctx.ops || {}).servers || {}
  const task = readFileSync(base, 'tasks', task)

  let conn
  for (const server in servers) {
    conn = getConnection(servers[server])
  }
  if (servers.length === 0) {
    consola.warn('No servers configured.')
  }
}
