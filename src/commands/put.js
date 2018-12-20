import { put } from '../ssh'

export default {
  match(ctx, line) {
    return line.trim().match(/^put\s+(.+)\s+(.+)/)
  },
  line(ctx, next) {
    this.sourcePath = ctx.match[1]
    this.targetPath = ctx.match[2]
    next()
  },
  command() {
    return put(this.sourcePath, this.targetPath)
  }
}
