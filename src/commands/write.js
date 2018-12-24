import { echo, append } from '../ssh'
import { localEcho, localAppend } from '../local'

export default {
  name: 'write',
  match(line) {
    const argv = [...this.argv]
    if (argv[0] === 'local') {
      argv.shift()
      this.local = true
    }
    this.op = argv[0]
    this.dedent = 0
    if (['append', 'echo'].includes(argv[0])) {
      return line.trim().match(
        new RegExp(`^(?:local\\s*)?${argv[0]}\\s+(.+?):$`)
      )
    }
  },
  line(line) {
    if (this.firstLine) {
      this.params.filePath = this.match[1]
      this.params.fileContents = []
      return true
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
  command() {
    const filePath = this.params.filePath
    const fileContents = this.params.fileContents
    if (this.local) {
      const cmd = ({ echo: localEcho, append: localAppend })[this.op]
      return cmd({ filePath, fileContents })
    } else {
      return ({ echo, append })[this.op]({ filePath, fileContents })
    }
  }
}
