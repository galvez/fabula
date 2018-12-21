
export default class Command {
  constructor(cmd) {
    this.cmd = cmd
    this.params = {}
    this.argv = []
    this.source = []
  }
  match (line) {
    return this.cmd.match.apply(this, line)
  }
  line (next) {
    return this.cmd.line.apply(this, next)
  }
  run () {
    this.cmd.command.apply(this) 
  }
}
