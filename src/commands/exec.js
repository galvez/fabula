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
  command(conn) {
    if (this.local) {
      return execLocal([this.argv[0], this.argv.slice(1)], this.env, this.settings.$cwd)
    } else {
      return exec(conn, this.params.cmd, this.env, this.settings.$cwd)
    }
  }
}
