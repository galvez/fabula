import { exec } from '../ssh'
import { execLocal } from '../local'

export default {
  match(line) {
    if (this.argv[0] === 'local') {
      this.local = true
      this.params.cmd = line.split(/^local\s+/)[1]
    } else {
      this.params.cmd = line
    }
    return true
  },
  command(conn) {
    if (this.local) {
      return execLocal(this.params.cmd, {
        stdio: ['ignore', process.stdout, process.stderr]
      })
    } else {
      return exec(conn, this.params.cmd)
    }
  }
}
