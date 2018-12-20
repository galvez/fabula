import { put } from '../ssh'

export default {
  run: put,
  match(line, ctx) {
    return line.trim().match(/^put\s+(.+)\s+(.+)/)
  },
  line(ctx, next) {
    ctx.args.push(ctx.match[1], ctx.match[2])
    next()
  },
  command(...args) {
    return runPut(...args)
  }
}
