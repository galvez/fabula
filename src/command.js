
export default class Command {
  constructor(cmd, line, match, next) {
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
  handleLine(line, next) {
    this.source.push(line)
    if (this.cmd.line.call(this, line)) {
      return
    }
  }
  run() {
    this.cmd.command.apply(this)
  }
}
