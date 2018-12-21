import { exec } from '../ssh'

export default {
  line(line, next) {
    this.params.cmd = line
    next()
  },
  command() {
    return exec(this.params.cmd)
  }
}
