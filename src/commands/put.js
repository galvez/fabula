import { put } from '../ssh'

export default {
  match(ctx, line) {
    return line.trim().match(/^put\s+(.+)\s+(.+)/)
  },
  line(ctx, next) {
    ctx.params.sourcePath = ctx.$match[1]
    ctx.params.targetPath = ctx.$match[2]
    next()
  },
  command(ctx) {
    return put(ctx.params.sourcePath, ctx.param.targetPath)
  }
}
