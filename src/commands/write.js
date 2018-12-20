export default {
  match(line) {
    if (['append', 'echo'].includes(ctx.argv[0])) {
      return line.trim().match(
        new RegExp(`^${ctx.argv[0]}\s+(.+?):$`)
      )
    }
  },
  line(ctx, next) {
    if (ctx.first) {
      ctx.commands.push(['append', ctx.match[1], []])
      this.index = ctx.commands.length - 1
    } else if (!/^\s+/.test(line)) {
      next()
    } else {
      ctx.commands[this.index][2].push(line)
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
