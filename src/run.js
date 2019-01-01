import { readFileSync } from 'fs'
import { parse } from 'path'
import { getConnection } from './ssh'
import { compile } from './compile'
import { createLogger } from './logging'

export async function runLocalSource(name, str, settings, logger) {
  settings = { ...settings, $name: name }
  const commands = await compile(name, str, settings)
  for (const command of commands) {
    if (!command.local) {
      logger.info('[FAIL]', command.source[0])
      logger.fatal('No servers specified to run this remote command.')
      process.exit()
    }
    if (await command.run(null, logger)) {
      process.exit()
    }
  }
}

export async function runSource(server, conn, name, str, settings, logger) {
  settings = {
    $server: {
      $id: server,
      ...conn.settings
    },
    $name: name,
    ...settings
  }
  const commands = await compile(name, str, settings)
  for (const command of commands) {
    if (await command.run(conn, logger)) {
      process.exit()
    }
  }
}

export async function run(source, config, servers = [], logger = null) {
  const name = parse(source).name
  source = readFileSync(source).toString()
  const settings = { ...config }

  if (logger == null) {
    logger = createLogger(name, config)
  }

  let remoteServers = servers
  if (servers.length === 0) {
    await runLocalSource(name, source, settings, logger)
    return
  }

  if (servers.length === 1 && servers[0] === 'all') {
    remoteServers = Object.keys(config.ssh)
  }

  let conn
  for (const server of remoteServers) {
    conn = await getConnection(config.ssh[server])
    await runSource(server, conn, name, source, settings, logger)
  }
}
