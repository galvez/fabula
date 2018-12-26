import { put } from '../ssh'

export default {
  match(line) {
    return line.trim().match(/^put\s+(.+)\s+(.+)/)
  },
  line() {
    this.params.sourcePath = this.match[1]
    this.params.targetPath = this.match[2]
  },
  command(conn) {
    return put(conn, this.params.sourcePath, this.param.targetPath)
  }
}
