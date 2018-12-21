import { exec } from '../ssh'

export default {
  line(line) {
    this.params.cmd = line
  },
  command() {
    exec(this.params.cmd)
  }
}
