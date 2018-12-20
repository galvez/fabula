import { runPut } from '../ssh'

export default {
  match(line) {
    return line.trim().match(/^put\s+(.+)\s+(.+)/)
  },
  line(ctx, next) {
    ctx.args.push([ctx.match[1], ctx.match[2]])
    next()
  },
  command(args) {
    const filePath = args[0]
    const match = args[1][0].match(/^\s+/)
    const indentation = match ? match[0].length : 0
    const dedented = args[1].map(line => line.slice(indentation))
    const fileContents = dedented.join('\n')
    return runPut({ filePath, fileContents })
  }
}
