import { readFileSync } from 'fs'
import { parse } from 'path'
import merge from 'lodash.merge'
import { getConnection } from './ssh'
import { compile } from './compile'
import { createLogger } from './logging'
import prompt from './prompt'

export async function runLocalSource(name, str, settings, logger) {
  settings = { ...settings, $name: name }
  let abort = false
  if (settings.$setter) {
    const fabula = {
      prompt,
      abort: () => {
        abort = true
      }
    }
    const setterResult = await settings.$setter(fabula)
    merge(settings, setterResult)
    delete settings.$setter
    if (abort) {
      return
    }
  }
  const commands = await compile(name, str, settings)
  for (const command of commands) {
    if (!command.local) {
      logger.info('[FAIL]', command.source[0])
      logger.fatal('No servers specified to run this remote command.')
      break
    }
    if (await command.run(null, logger)) {
      break
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
  let abort = false
  if (settings.$setter) {
    const fabula = {
      prompt,
      abort: () => {
        abort = true
      }
    }
    const setterResult = await settings.$setter(fabula)
    merge(settings, setterResult)
    delete settings.$setter
    if (abort) {
      return
    }
  }
  const commands = await compile(name, str, settings)
  for (const command of commands) {
    if (await command.run(conn, logger)) {
      break
    }
  }
}

export async function run(source, config, servers = [], logger = null) {
  const name = parse(source).name
  source = readFileSync(source).toString()

  // Setup main settings
  if (typeof config.fail === 'undefined') {
    config.fail = true
  }
  const settings = { ...config }

  // Create logger if not provided
  if (logger == null) {
    logger = createLogger(name, config)
  }

  let remoteServers = servers

  // If no servers provided, run in local mode
  if (servers.length === 0) {
    await runLocalSource(name, source, settings, logger)
    return
  }

  // Run in all servers
  if (servers.length === 1 && servers[0] === 'all') {
    remoteServers = Object.keys(config.ssh)
  }

  let conn
  const runners = []
  for (const server of remoteServers) {
    runners.push(() => new Promise(async (resolve) => {
      conn = await getConnection(config.ssh[server])
      await runSource(server, conn, name, source, settings, logger)
      resolve()
    }))
  }
  await Promise.all(runners.map(runner => runner()))
}
