import { echo, append } from '../ssh'
import { localEcho, localAppend } from '../local'

export default {
  match(line) {
    const argv = [...this.argv]
    if (argv[0] === 'local') {
      this.op = `${argv.shift()}Local`
      this.local = true
    } else {
      this.op = argv[0]
    }
    if (['append', 'echo'].includes(argv[0])) {
      return line.trim().match(
        new RegExp(`^(?:local\s*)?${argv[0]}\\s+(.+?):$`)
      )
    }
  },
  line(line) {
    if (this.firstLine) {
      this.params.filePath = this.match[1]
      this.params.fileContents = []
      return true
    } else if (!/^\s+/.test(line)) {
      const match = this.params.fileContents[0].match(/^\s+/)
      const indentation = match ? match[0].length : 0
      this.params.fileContents = this.params.fileContents
        .map(line => line.slice(indentation)).join('\n')
      return false
    } else {
      this.params.fileContents.push(line)
      return true
    }
  },
  command() {
    if (this.local) {
      return ({ localEcho, localAppend })[this.op]({
        filePath: this.params.filePath,
        fileContents: this.params.fileContents
      })
    } else {
      return ({ echo, append })[this.op]({
        filePath: this.params.filePath,
        fileContents: this.params.fileContents
      })
    }
  }
}
