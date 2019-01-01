import { readFile } from 'fs'
import { runSource, runLocalSource } from '../run'

export default {
  match(line) {
    this.dedent = 0
    let match
    // eslint-disable-next-line no-cond-assign
    if (match = line.match(/^fabula\s+\.\s+([^ ]+?)\s*$/)) {
        this.params.filePath = this.match[1]
      return match
    }
  },
  async command(conn, logger) {
    const settings = {
      ...this.settings,
      fail: true
    }
    const commands = readFile(this.params.filePath).toString()
    if (this.local) { 
      await runLocalSource(this.settings.$name, commands, settings, logger)
    } else {
      await runSource(this.context.server, conn, this.settings.$name, commands, settings, logger)
    }
  }
}
