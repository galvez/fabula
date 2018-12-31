import { exec } from '../ssh'
import { execLocal } from '../local'

export default {
  prepend(prepend) {
    // Don't filter sudo from prepend for exec
    return prepend
  },
  match(line) {
    if (this.local) {
      this.params.cmd = line.split(/^local\s+/)[1]
    } else {
      this.params.cmd = line
    }
    return true
  },
  async command(conn) {
    if (this.local) {
      try {
        const result = await execLocal(this.params.cmd, this.env)
        return result
      } catch (io) {
        return { stdout: io.stdout, stderr: io.stderr }
      }
    } else {
      return exec(conn, this.params.cmd, this.env)
    }
  }
}
