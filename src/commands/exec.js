import { exec } from '../ssh'
import { execLocal } from '../local'

export default {
  name: 'exec',
  match(line) {
    if (this.argv[0] === 'local') {
      this.local = true
      this.params.cmd = line.split(/^local\s+/)[1]
    } else {
      this.params.cmd = line
    }
    return true
  },
  command() {
    if (this.local) {
      return execLocal(this.params.cmd)
    } else {
      return exec(this.conn, this.params.cmd)
    }
  }
}
