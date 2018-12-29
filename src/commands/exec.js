import { exec } from '../ssh'
import { execLocal } from '../local'

export default {
  match(line) {
    if (this.local) {
      this.params.cmd = line.split(/^local\s+/)[1]
    } else {
      this.params.cmd = line
    }
    return true
  },
  command(conn) {
    if (this.local) {
      try {
        const result = execLocal(this.params.cmd, this.env)
        return { stdout: result }
      } catch (io) {
        return { stdout: io.stdout, stderr: io.stderr }
      }
    } else {
      return exec(conn, this.params.cmd, this.env)
    }
  }
}
