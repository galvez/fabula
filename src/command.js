
export default class Command {
  constructor(cmd, line, match) {
    console.log('constructor', line)
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
    console.log('handleLine', line)
    this.source.push(line)
    return this.cmd.line.call(this, line)
  }
  run() {
    this.cmd.command.apply(this)
  }
}
