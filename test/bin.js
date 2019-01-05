void function main() {
  const
    args = require('arg')({
      '--code': Number,
      '--stdout': String,
      '--stderr': String,
    }),
    code = args['--code'] || 0,
    stdout = args['--stdout'],
    stderr = args['--stderr']

  if (stdout) {
    process.stdout.write(`${stdout}\n`)
  }

  if (stderr) {
    process.stdout.write(`${stderr}\n`)
  } else if (code) {
    process.stdout.write(`Exit code: ${code}\n`)
  }

  process.exit(code)
}()
