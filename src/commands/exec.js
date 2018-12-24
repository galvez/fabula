import { exec } from '../ssh'
import { execLocal } from '../local'

export default {
  line(line) {
    this.params.cmd = line
  },
  command() {
    exec(this.params.cmd)
  }
}
