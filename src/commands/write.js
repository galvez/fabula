import { write, append } from '../ssh'
import { localWrite, localAppend } from '../local'

export default {
  patterns: {
    block: (argv) => {
      return new RegExp(`^(?:local\\s*)?${argv[0]}\\s+(.+?):$`)
    },
    string: (argv) => {
      return new RegExp(`^(?:local\\s*)?${argv[0]}\\s+([^ ]+?)\\s+([^ :]+?)$`)
    }
  },
  match(line) {
    this.op = this.argv[0]
    this.dedent = 0
    if (['append', 'write'].includes(this.argv[0])) {
      let match
      // eslint-disable-next-line no-cond-assign
      if (match = line.match(this.cmd.patterns.block(this.argv))) {
        this.block = true
        return match
      // eslint-disable-next-line no-cond-assign
      } else if (match = line.match(this.cmd.patterns.string(this.argv))) {
        this.string = true
        return match
      }
    }
  },
  line(line) {
    if (this.firstLine) {
      this.params.filePath = this.match[1]
      this.params.fileContents = []
      if (this.string) {
        const settingsKey = this.match[2]
        this.params.fileContents = () => {
          // eslint-disable-next-line no-eval
          if (settingsKey.startsWith('strings.')) {
            return eval(`this.settings.${settingsKey}`).split(/\n/g)
          } else if (settingsKey.startsWith('vars.')) {
            return eval(`this.settings.${settingsKey}`)
          }
        }
        return false
      } else {
        return true
      }
    } else if (!/^\s+/.test(line)) {
      return false
    } else {
      if (this.params.fileContents.length === 0) {
        const match = line.match(/^\s+/)
        if (match) {
          this.dedent = match[0].length
        }
      }
      this.params.fileContents.push(line.slice(this.dedent))
      return true
    }
  },
  command(conn) {
    const filePath = this.params.filePath
    const fileContents = typeof this.params.fileContents === 'function'
      ? this.params.fileContents()
      : this.params.fileContents.join('\n')
    if (this.local) {
      const cmd = ({ write: localWrite, append: localAppend })[this.op]
      return cmd(filePath, fileContents)
    } else {
      return ({ write, append })[this.op](conn, filePath, fileContents)
    }
  }
}
