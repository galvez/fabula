import { exec } from '../ssh'

export default {
  line(line) {
    this.params.cmd = line
  },
  command() {
    return exec(this.params.cmd)
  }
}
