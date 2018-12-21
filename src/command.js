
export default class Command {
  constructor(cmd, match, line) {
    this.cmd = cmd
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
  handleLine (line, next) {
    this.firstLine = false
    this.source.push(line)
    return this.cmd.line.apply(this, next)
  }
  run () {
    this.cmd.command.apply(this) 
  }
}
