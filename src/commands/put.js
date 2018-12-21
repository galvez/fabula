import { put } from '../ssh'

export default {
  match(line) {
    return line.trim().match(/^put\s+(.+)\s+(.+)/)
  },
  line(next) {
    this.params.sourcePath = this.match[1]
    this.params.targetPath = this.match[2]
    next()
  },
  command() {
    return put(this.params.sourcePath, this.param.targetPath)
  }
}
