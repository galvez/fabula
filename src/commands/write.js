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
    const argv = [...this.argv]
    if (argv[0] === 'local') {
      argv.shift()
      this.local = true
    }
    this.op = argv[0]
    this.dedent = 0
    if (['append', 'write'].includes(argv[0])) {
      let match
      // eslint-disable-next-line no-cond-assign
      if (match = line.match(this.cmd.patterns.block(argv))) {
        this.block = true
        return match
      // eslint-disable-next-line no-cond-assign
      } else if (match = line.match(this.cmd.patterns.string(argv))) {
        this.string = true
        return match
      }
    }
  },
  line(line) {
    if (this.firstLine) {
      this.params.filePath = this.match[1]
      this.params.fileContents = ''
      if (this.string) {
        const settingsKey = this.match[2]
        // eslint-disable-next-line no-eval
        this.params.fileContents = eval(`this.settings.${settingsKey}`)
        return false
      } else {
        return true
      }
    } else if (!/^\s+/.test(line)) {
      this.params.fileContents = this.params.fileContents.replace(/\n$/g, '')
      return false
    } else {
      if (this.params.fileContents.length === 0) {
        const match = line.match(/^\s+/)
        if (match) {
          this.dedent = match[0].length
        }
      }
      this.params.fileContents += `${line.slice(this.dedent)}\n`
      return true
    }
  },
  command(conn) {
    const filePath = this.params.filePath
    const fileContents = this.params.fileContents
    if (this.local) {
      const cmd = ({ write: localWrite, append: localAppend })[this.op]
      return cmd(filePath, fileContents)
    } else {
      return ({ write, append })[this.op](conn, filePath, fileContents)
    }
  }
}
