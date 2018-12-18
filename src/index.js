
import { readFileSync } from 'fs'
import consola from 'consola'
import { getConnection } from './ssh'

// import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
// import { join, resolve, parse } from 'path'
// import klawSync from 'klaw-sync'
// import defaults from './defaults'

// const resolvePath = (base, ...args) => resolve(base, ...args)

function compile(cmd) {
  cmd = cmd.toString()
  const lines = cmd.split(/\n/g)
  const commands = []
  let match
  let echoIndex
  let echo = false
  for (const line of lines) {
    const parts = line.split()
    if (echo) {
      if (!/^\s+/.test(line)) {
        echo = false
      } else {
        commands[echoIndex].push(line)
      }
    } else if (line.startsWith('local')) {
      commands.push(parts.slice(1))
    // eslint-disable-next-line no-cond-assign
    } else if (match = line.trim().match(/^echo\s+(.+?):$/)) {
      commands.push([match[0]])
      echoIndex = commands.length
    } else {
      commands.push(line)
    }
  }
  return commands
}

export function run(config, task) {
  const base = config.srcDir
  const servers = (config.ops || {}).servers || {}
  task = readFileSync(base, 'tasks', task)

  for (const server in servers) {
    getConnection(servers[server])
  }
  if (servers.length === 0) {
    consola.warn('No servers configured.')
  }
}

if (require.main === module) {
  console.log( // eslint-disable-line
    compile(readFileSync('test/fixtures/setup-ssh.sh'))
  )
}
