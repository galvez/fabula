import { exec } from '../ssh'

export default {
  line(line) {
    this.params.cmd = line
    return true
  },
  command() {
    exec(this.params.cmd)
  }
}
