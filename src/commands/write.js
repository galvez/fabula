
export default {
  match(ctx, line) {
    ctx.argv = [ ...ctx.argv ]
    if (['append', 'echo'].includes(ctx.argv[0])) {
      return line.trim().match(
        new RegExp(`^${ctx.argv[0]}\s+(.+?):$`)
      )
    }
  },
  line(ctx, next) {
    if (ctx.first) {
      ctx.params.filePath = ctx.match[1], []
      ctx.params.fileContents = []
    } else if (!/^\s+/.test(ctx.line)) {
      next()
    } else {
      ctx.params.fileContents.push(ctx.line)
    }
  },
  command(ctx) {
    const match = ctx.params.fileContents[0].match(/^\s+/)
    const indentation = match ? match[0].length : 0
    const dedented = ctx.params.fileContents.map(line => line.slice(indentation))
    return {
      filePath: ctx.params.filePath,
      fileContents: dedented.join('\n')
    }
  }
}
