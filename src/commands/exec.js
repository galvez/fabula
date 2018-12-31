import { exec } from '../ssh'
import { execLocal } from '../local'

export default {
  prepend(command) {
    // Custom commands run under the same permission
    // **Fabula** is running on -- so sudo is never prepended
    return command.replace(/\bsudo\s+/, '')
  },
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
