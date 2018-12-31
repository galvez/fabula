import { readFileSync, createWriteStream } from 'fs'
import { parse } from 'path'
import { compile } from './compile'
import { createLogger } from './logging'

export async function runLocalString(name, str, settings, logger) {
  const commands = compile(name, str, settings)
  logger.setContext('global', 'local')
  for (const command of commands) {
    try {
      if (!command.local) {
        logger.info('[FAIL]', command.source[0])
        logger.fatal('No servers specified to run this remote command.')
        process.exit()
      }
      const response = await command.run()
      if (response) {
        if (response.stdout) {
          for (const line of response.stdout.split(/\n/g).filter(Boolean)) {
            logger.info(line.trim())
          }
        }
        if (response.stderr) {
          for (const line of response.stderr.trim().split(/\n/g).filter(Boolean)) {
            logger.error(line.trim())
          }
        }
      }
      logger.info('[OK]', command.source[0])
    } catch (err) {
      logger.info('[FAIL]', command.source[0])
      logger.fatal(err)
      break
    }
  }
}

export async function runString(server, conn, name, str, settings, logger) {
  logger.setContext('global', 'ssh', server)
  settings = {
    ...settings,
    $server: conn.settings
  }
  const commands = compile(name, str, settings)
  for (const command of commands) {
    try {
      const response = await command.run(conn)
      if (response) {
        if (response.stdout) {
          for (const line of response.stdout.split(/\n/g).filter(Boolean)) {
            logger.info(`[${server}]`, line.trim())
          }
        }
        if (response.stderr) {
          for (const line of response.stderr.trim().split(/\n/g).filter(Boolean)) {
            logger.error(`[${server}]`, line.trim())
          }
        }
      }
      logger.info(`[${server}] [OK]`, command.source[0])
    } catch (err) {
      logger.error(`[${server}] [FAIL]`, command.source[0])
      logger.fatal(err)
      break
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
