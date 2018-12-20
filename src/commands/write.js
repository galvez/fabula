import { runPut, runAppend } from '../ssh'

export default {
  match(ctx) {
    ctx.argv = [ ...ctx.argv ]
    if (['append', 'echo'].includes(ctx.argv[0])) {
      return line.trim().match(
        new RegExp(`^${ctx.argv[0]}\s+(.+?):$`)
      )
    }
  },
  line(ctx, next) {
    if (ctx.first) {
      this.args.push(ctx.match[1], [])
    } else if (!/^\s+/.test(ctx.line)) {
      next()
    } else {
      this.args[2].push(ctx.line)
    }
  },
  command(tree) {
    const filePath = tree[0]
    const match = tree[1][0].match(/^\s+/)
    const indentation = match ? match[0].length : 0
    const dedented = tree[1].map(line => line.slice(indentation))
    const fileContents = dedented.join('\n')
    return { filePath, fileContents }
  }
}
