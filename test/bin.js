async function main (shell = true, argv = process.argv) {
  const args = require('arg')({
      '--code': Number,
      '--stdout': String,
      '--stderr': String,
    }, { argv })

  const
    // eslint-disable-next-line no-eval
    stdout = args['--stdout'],
    // eslint-disable-next-line no-eval
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
  return result
}

exports.default = main

if (require.main === module) {
  main().then() // (result) =>   process.exit(result.code))
}
