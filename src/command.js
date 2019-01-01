
export function parseArgv(line) {
  // Yes, I did write my own argv parser.
  // If you've got a better suggestion
  // (perhaps a Node.js built-in I missed)
  // Please let me know!
  const tokens = []
  let token = ''
  let quote = false
  let escape = false
  for (let i = 0; i < line.length; i++) {
    if (line[i] === ' ' && !quote && !escape) {
      tokens.push(token)
      token = ''
    } else if (line[i].match(/\\/)) {
      escape = true
    } else if (line[i].match(/['"`]/) && !escape) {
      quote = !quote
      token += line[i]
    } else {
      token += line[i]
    }
  }
  if (token.length) {
    tokens.push(token)
  }
  return tokens
}

export default class Command {
  constructor(cmd, line, env) {
    this.cmd = { ...cmd }
    this.params = {}
    this._env = env
    this.argv = parseArgv(line)
    this.local = this.argv[0] === 'local'
    if (this.local) {
      this.argv.shift()
    }
    this.source = [line]
    this.firstLine = true
  }
  registerHandler(line) {
    let match
    // eslint-disable-next-line no-cond-assign
    if (match = line.match(/^(.+?)(@[\w\d_]+)\s+$/)) {
      this.handler = match[2]
      return match[1]
    } else {
      return line
    }
  }
  prepend(prepend, line) {
    if (this.cmd.prepend) {
      prepend = this.cmd.prepend(prepend)
    } else {
      // Custom commands run under the same permission
      // Fabula is running on -- so sudo is never prepended
      prepend = parseArgv(prepend)
        .filter(part => part !== 'sudo').join(' ')
    }
    line = `${prepend} ${line}`
    this.argv = parseArgv(line)
    this.local = this.argv[0] === 'local'
    if (this.local) {
      this.argv.shift()
    }
    this.source = [line]
    return line
  }
  handleLine(line) {
    if (!this.cmd.line) {
      if (this.firstLine) {
        this.firstLine = false
      }
      return false
    }
    const continueCommand = this.cmd.line.call(this, line)
    if (!this.firstLine && continueCommand) {
      this.source.push(line)
    }
    if (this.firstLine) {
      this.firstLine = false
    }
    return continueCommand
  }
  logLines(out, writer) {
    if (typeof out !== 'string') {
      return
    }
    for (const line of out.split(/\n/g)) {
      if (line) {
        writer(line)
      }
    }
  }
  get env() {
    if (this.local) {
      return {
        ...this.settings.env.local,
        ...this._env
      }
    } else {
      return {
        ...this.settings.env.ssh,
        ...this._env
      }
    }
  }
  get context() {
    if (this._context) {
      return this._context
    }
    const ctx = { local: this.local }
    if (this.settings.$server) {
      ctx.server = this.settings.$server.$id
    }
    this._context = ctx
    return ctx
  }
  async run(conn, logger, retry = null) {
    let abort = this.settings.fail
    const result = await this.cmd.command.call(this, conn, logger)
    if (this.handler && this.settings[this.handler]) {
      const fabula = {
        abort: () => {
          abort = true
        }
      }
      await this.settings[this.handler](result, fabula)
    }
    if (result) {
      if (result.code && retry) {
        return this.run(conn, logger, retry - 1)
      }
      if (result.code && typeof this.settings.retry === 'number') {
        return this.run(conn, logger, this.settings.retry)
      }
      this.logLines(result.stdout, line => logger.info(this.context, line))
      this.logLines(result.stderr, line => logger.info(this.context, line))
      if (abort) {
        logger.info(this.context, '[ABORT]', this.argv.join(' '))
        return true
      } else {
        logger.info(this.context, result.code ? '[FAIL]' : '[OK]', this.argv.join(' '))
      }
    }
    if (abort) {
      return true
    }
  }
}
