import { exec } from '../ssh'

export default {
  line(line, ctx) {
    this.args = line
  },
  command(ctx) {
    return exec(ctx.args[0])
  }
}
