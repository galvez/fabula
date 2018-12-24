import { exec } from '../ssh'
import { execLocal } from '../local'

export default {
  match(line) {
    if (this.argv[0] === 'local') {
      this.op = 'execLocal'
      this.params.cmd = line.split(/^local\s+/)[1]
    } else {
      this.op = 'exec'
      this.params.cmd = line
      return true
    }
  },
  command() {
    return ({ exec, execLocal })[this.op](this.params.cmd)
  }
}
