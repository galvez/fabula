import { createWriteStream } from 'fs'

class Reporter {
  constructor (stream) {
    this.stream = stream
  }
  log (logObj) {
    this.stream.write(JSON.stringify(logObj) + '\n')
  }
}

createLogger.loggers = {
  $servers: {}
}

createLogger.addLogger = function(logger, path) {
  const stream = createWriteStream(path, {flags: 'a'})
  createLogger.loggers[logger] = consola.create(({
    reporters: [new Reporter(stream)]
  }))
}

createLogger.addServerLogger = function(server, path) {
  const stream = createWriteStream(path, {flags: 'a'})
  createLogger.loggers.$servers[server] = consola.create(({
    reporters: [new Reporter(stream)]
  }))
}

export function createLogger(config) {
  const loggers = createLogger.loggers
  if (!config.logs) {
    return loggers
  }
  for (const logContext of ['global', 'local', 'ssh']) {
    if (logContext in config.logs) {
      createLogger.addLogger(logContext, config.logs[logContext])
    }
  }
  return new Proxy({}, {
    get (_, prop) {
      return (context, ...msg) => {
        // Log normally to stdout
        consola[prop](...msg)
        for (const logContext of context) {
          // Global, Local, SSH contexts
          if (logContext in loggers) {
            loggers[logContext][prop](...msg)
          // Server contexts
          } else if (logContext in loggers.$servers) {
            loggers.$servers[logContext][prop](...msg)
          }
        }
      }
    }
  })
}
