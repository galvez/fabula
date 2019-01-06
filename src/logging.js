import { createWriteStream } from 'fs'
import consola from 'consola'

export let active = 0

class Reporter {
  constructor(stream) {
    this.stream = stream
  }
  log(logObj) {
    active += 1
    this.stream.write(JSON.stringify(logObj) + '\n', () => {
      active -= 1
    })
  }
}

class Logger {
  constructor(name, config) {
    this.loggers = {
      $server: new Proxy({}, {
        get: (_, prop) => {
          return this.loggers[`server:${prop}`]
        }
      })
    }
    for (const logContext of ['global', 'local', 'ssh']) {
      if (logContext in config.logs) {
        this.addLogger(logContext, config.logs[logContext])
      }
    }
    if (config.ssh) {
      for (const server in config.ssh) {
        if (typeof config.ssh[server].log === 'string') {
          this.addLogger(`server:${server}`, config.ssh[server].log)
        }
      }
    }
  }
  // Creates a logger under a name and path
  addLogger(logger, path) {
    const stream = createWriteStream(path, { flags: 'a' })
    this.loggers[logger] = consola.create(({
      reporters: [new Reporter(stream)]
    }))
    return this.loggers[logger]
  }
  // Returns a logger by name
  getLogger(logger, path) {
    if (logger in this.loggers) {
      return this.loggers[logger]
    }
    return this.addLogger(logger, path)
  }
}

export function createLogger(name, config) {
  const logger = new Logger(name, config)
  return new Proxy({}, {
    get(_, prop) {
      return (...args) => {
        // Determine context, if available
        let context
        const msg = args
        if (typeof msg[0] === 'object') {
          context = msg.shift()
        }
        if (context) {
          // Determine msg host
          if (context.local) {
            msg.unshift('[local]')
          } else if (context.server) {
            msg.unshift(`[${context.server}]`)
          }
          // Add component log entry if enabled
          if (context && context.log) {
            logger.getLogger(name, context.log)[prop](...msg)
          }
          // Add local log entry if enabled
          if (context.local && logger.loggers.local) {
            logger.loggers.local[prop](...msg)
          // Or add  server log entry if enabled
          } else {
            if (logger.loggers.$server[context.server]) {
              logger.loggers.$server[context.server][prop](...msg)
            }
            logger.loggers.ssh[prop](...msg)
          }
          // Add global log entry if enabled
          if (logger.loggers.global) {
            logger.loggers.global[prop](...msg)
          }
        }
        // Log to stdout if not silent
        if (!config.silent) {
          consola[prop](...msg)
        }
      }
    }
  })
}
