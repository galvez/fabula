
export default class Command {
  constructor(cmd, line, match) {
    this.cmd = { ...cmd }
    this.params = {}
    this.match = match
    this.argv = this._expandTildes(line.split(/\s+/))
    this.source = []
    this.firstLine = true
  }
  _expandTildes(argv) {
    return argv.map((arg) => {
      if (arg.startsWith('~')) {
        return `${process.env.HOME}${arg.slice(1)}`
      }
      return arg
    })
  }
  handleLine(line) {
    if (!this.cmd.line) {
      this.source.push(line)
      return false
    }
    if (this.firstLine) {
      this.firstLine = false
    }
    const continueCommand = this.cmd.line.call(this, line)
    this.source.push(line)
    return continueCommand
  }
  run() {
    this.cmd.command.apply(this)
  }
}
