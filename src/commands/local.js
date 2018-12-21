import { exec as execLocal } from 'child_process'

const execLocalAsync = promisify(execLocal)

export default {
  line(line, next) {
    this.params.cmd = line
    next()
  },
  command() {
    return execLocal(this.params.cmd)
  }
}
