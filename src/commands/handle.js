
import merge from 'lodash.merge'
import prompt from '../prompt'
import { exec } from '../ssh'
import { execLocal } from '../local'
import { runSource, runLocalSource } from '../run'

export default {
  name: 'handle',
  patterns: {
    block: /^(?:local\s*)?(.+?)\s*@([\w\d_]+):\s*$/,
    global: /^(?:local\s*)?(.+?)\s*@([\w\d_]+)\s*$/
  },
  match(line) {
    this.dedent = 0
    let match
    // eslint-disable-next-line no-cond-assign
    if (match = line.match(this.cmd.patterns.block)) {
      this.block = true
      this.params.cmd = match[1]
      this.handler = match[2]
      return match
    // eslint-disable-next-line no-cond-assign
    } else if (match = line.match(this.cmd.patterns.global)) {
      this.global = true
      this.params.cmd = match[1]
      this.handler = match[2]
      return match
    }
  },
  line(line) {
    if (this.firstLine) {
      if (this.global) {
        return false
      } else {
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
    const settings = { ...this.settings }
    let result
    if (this.local) {
      this.argv.pop()
      result = await execLocal([this.argv[0], this.argv.slice(1)], this.env, this.settings.$cwd)
    } else {
      result = await exec(conn, this.params.cmd, this.env, this.settings.$cwd)
    }
    let abort = false
    const fabula = {
      prompt,
      abort: () => {
        abort = true
      }
    }
    if (this.handler && this.settings[this.handler]) {
      merge(settings, await this.settings[this.handler](result, fabula))
    }
    if (abort) {
      return false
    }
    const commands = this.params.commands.join('\n')
    if (this.context.server) {
      await runSource(this.context.server, conn, this.settings.$name, commands, settings, logger)
    } else {
      await runLocalSource(this.settings.$name, commands, settings, logger)
    }
  }
}
