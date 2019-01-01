import { get } from '../ssh'

export default {
  match(line) {
    return line.trim().match(/^get\s+(.+)\s+(.+)/)
  },
  line() {
    this.params.sourcePath = this.match[1]
    this.params.targetPath = this.match[2]
  },
  command(conn) {
    return get(conn, this.params.sourcePath, this.param.targetPath)
  }
}
