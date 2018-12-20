import { runPut } from '../ssh'

export default {
  match(line) {
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
