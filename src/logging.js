import consola from 'consola'
import { createWriteStream } from 'fs'

class Reporter {
  constructor (stream) {
    this.stream = stream
  }
  log (logObj) {
    this.stream.write(JSON.stringify(logObj) + '\n')
  }
}

class Logger {
  constructor(config) {
    this.context = []
    this.loggers = {
      $servers: {}
    }
    if (!config.logs) {
      return loggers
    }
    for (const logContext of ['global', 'local', 'ssh']) {
      if (logContext in config.logs) {
        this.addLogger(logContext, config.logs[logContext])
      }
    }
  }
  setContext (...context) {
    this.context = context
  }
  addLogger (logger, path) {
    const stream = createWriteStream(path, {flags: 'a'})
    this.loggers[logger] = consola.create(({
      reporters: [new Reporter(stream)]
    }))
  }
  addServerLogger(server, path) {
    const stream = createWriteStream(path, {flags: 'a'})
    this.loggers.$servers[server] = consola.create(({
      reporters: [new Reporter(stream)]
    }))
  }
}

export function createLogger (config) {
  const logger = new Logger(config)
  return new Proxy({}, {
    get (_, prop) {
      if (['addLogger', 'addServerLogger', 'setContext'].includes(prop)) {
        return logger[prop].bind(logger)
      }
      return (...msg) => {
        // Log normally to stdout
        consola[prop](...msg)
        for (const logContext of logger.context) {
          // Global, Local, SSH contexts
          if (logContext in logger.loggers) {
            logger.loggers[logContext][prop](...msg)
          // Server contexts
          } else if (logContext in logger.loggers.$servers) {
            logger.loggers.$servers[logContext][prop](...msg)
          }
        }
      }
    }
  })
}
