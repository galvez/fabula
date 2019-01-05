function main (shell = true, argv = process.argv) {
  const
    args = require('arg')({
      '--code': Number,
      '--stdout': String,
      '--stderr': String,
    }, { argv }),
    stdout = args['--stdout'],
    stderr = args['--stderr'],
    result = {
      code: args['--code'] || 0
    }

  if (stdout) {
    result.stdout = `${stdout}\n`
  }
  if (stderr) {
    result.stderr = `${stderr}\n`
  } else if (result.code) {
    result.stderr = `exit code: ${result.code}\n`
  }
  if (!shell) {
    return result
  }

  if (result.stdout) {
    process.stdout.write(result.stdout)
  }
  if (result.stderr || result.code) {
    process.stderr.write(result.stderr)
  }
  process.exit(result.code)
}

exports.default = main

if (require.main === module) {
  main(true)
}
