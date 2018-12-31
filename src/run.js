import { readFileSync, createWriteStream } from 'fs'
import { parse } from 'path'
import { compile } from './compile'
import { createLogger } from './logging'

export async function runLocalSource(name, str, settings, logger) {
  const commands = compile(name, str, settings)
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
  settings = { $server: conn.settings, ...settings }
  const commands = compile(name, str, settings)
  for (const command of commands) {
    if (await command.run(conn, logger)) {
      process.exit()
    }
  }
}

export async function run(source, config, servers = []) {
  const name = parse(source).name
  source = readFileSync(source).toString()
  const settings = { ...config }
  const logger = createLogger(config)

  let remoteServers = servers
  if (servers.length === 0) {
    await runLocalString(name, source, settings, logger)
    return
  }

  if (servers.length === 1 && servers[0] === 'all') {
    remoteServers = Object.keys(config.ssh)
  }

  let conn
  for (const server of remoteServers) {
    conn = await getConnection(config.ssh[server])
    if (config.ssh[server].log) {
      logger.addServerLogger(server, config.ssh[server].log)
    }
    await runString(server, conn, name, source, settings, logger)
  }
}
