import { put } from '../ssh'

export default {
  match(line, ctx) {
    return line.trim().match(/^put\s+(.+)\s+(.+)/)
  },
  line(ctx, next) {
    ctx.args.push(ctx.match[1], ctx.match[2])
    next()
  },
  command(ctx) {
    return put(...ctx.args)
  }
}
