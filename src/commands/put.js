import { put } from '../ssh'

export default {
  name: 'put',
  match(line) {
    return line.trim().match(/^put\s+(.+)\s+(.+)/)
  },
  line() {
    this.params.sourcePath = this.match[1]
    this.params.targetPath = this.match[2]
  },
  command() {
    return put(this.params.sourcePath, this.param.targetPath)
  }
}
