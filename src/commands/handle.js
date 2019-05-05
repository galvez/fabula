import { runSource, runLocalSource } from '../run'

export default {
  name: 'handle',
  patterns: {
    block: /^(?:local\s*)?(.+?)@([\w\d_]+):\s*$/,
    global: /^(?:local\s*)?(.+?)@([\w\d_]+)\s*$/
  },
  match(line) {
    this.dedent = 0
    let match
    // eslint-disable-next-line no-cond-assign
    if (match = line.match(this.cmd.patterns.block)) {
      this.block = true
      this.handler = match[2]
      return match
    // eslint-disable-next-line no-cond-assign
    } else if (match = line.match(this.cmd.patterns.global)) {
      this.global = true
      this.handler = match[2]
      return match
    }
  },
  line(line) {
    if (this.firstLine) {
      if (this.global) {
        this.settings.$cwd = this.match[1]
        return false
      } else {
        this.params.cwd = this.match[1]
        this.params.commands = []
        return true
      }
    } else if (!/^\s+/.test(line)) {
      return false
    } else {
      if (this.params.commands.length === 0) {
        const match = line.match(/^\s+/)
        if (match) {
          this.dedent = match[0].length
        }
      }
      this.params.commands.push(line.slice(this.dedent))
      return true
    }
  },
  async command(conn, logger) {
    const settings = {
      ...this.settings,
      fail: true,
      $cwd: resolve(
        this.settings.$cwd || process.cwd(),
        this.params.cwd
      )
    }
    const commands = this.params.commands.map((cmd) => {
      if (this.local && !/^\s+/.test(cmd)) {
        cmd = `local ${cmd}`
      }
      return cmd
    }).join('\n')
    if (this.local) {
      await runLocalSource(this.settings.$name, commands, settings, logger)
    } else {
      await runSource(this.context.server, conn, this.settings.$name, commands, settings, logger)
    }
  }
}
