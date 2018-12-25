import { echo, append } from '../ssh'
import { localEcho, localAppend } from '../local'

export default {
  name: 'write',
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
    if (['append', 'echo'].includes(argv[0])) {
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
      if (this.block) {
        this.params.fileLines = []
        return true
      } else if (this.string) {
        // eslint-disable-next-line no-eval
        const settingsKey = this.match[2]
        this.params.fileBody = eval(`this.settings.${settingsKey}`)
        return false
      }
      return true
    } else if (!/^\s+/.test(line)) {
      return false
    } else {
      if (this.params.fileLines.length === 0) {
        const match = line.match(/^\s+/)
        if (match) {
          this.dedent = match[0].length
        }
      }
      this.params.fileLines.push(line.slice(this.dedent))
      return true
    }
  },
  command(conn) {
    const filePath = this.params.filePath
    const fileContents = this.string
      ? this.params.fileBody.split('\n')
      : this.params.fileLines

    if (this.local) {
      const cmd = ({ echo: localEcho, append: localAppend })[this.op]
      return cmd({ filePath, fileContents })
    } else {
      return ({ echo, append })[this.op](conn, { filePath, fileContents })
    }
  }
}
