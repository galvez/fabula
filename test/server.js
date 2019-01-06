 
const 
  // Standard library imports
  fs = require('fs'),
  { resolve } = require('path'),
  crypto = require('crypto'),
  // Node module imports
  buffersEqual = require('buffer-equal-constant-time'),
  ssh2 = require('ssh2'),
  ip = require('ip'),
  getPort = require('get-port'),
  // Local imports
  { parseArgv } = require('../src/command'),
  bin = require('./bin'),
  // Settings
  privateKey = resolve(__dirname, 'fixtures', 'keys', 'ssh.private'),
  passphrase = 'fabula'

function genPublicKey() {
  const pubKey = fs.readFileSync(resolve(__dirname, 'fixtures', 'keys', 'ssh.public'))
  return ssh2.utils.genPublicKey(ssh2.utils.parseKey(pubKey))
}

function authenticateSession(ctx) {
  const pubKey = genPublicKey()
  if (ctx.method === 'password') {
    ctx.reject()
  } else if (
    ctx.method === 'publickey' &&
    ctx.key.algo === pubKey.fulltype &&
    buffersEqual(ctx.key.data, pubKey.public)
  ) {
    if (ctx.signature) {
      const verifier = crypto.createVerify(ctx.sigAlgo)
      verifier.update(ctx.blob)
      if (verifier.verify(pubKey.publicOrig, ctx.signature)) {
        ctx.accept()
      } else {
        ctx.reject()
      }
    } else {
      ctx.accept()
    }
  } else {
    ctx.reject()
  }
}

exports.launchTestSSHServer = async function() {

  const privateKey = resolve(__dirname, 'fixtures', 'keys', 'ssh.private')
  const hostKeys = [{
    key: fs.readFileSync(privateKey),
    passphrase
  }]

  const server = new ssh2.Server({ hostKeys }, (client) => {
    client.on('authentication', authenticateSession)
    client.on('session', (acceptSession) => {
      acceptSession().session.once('shell', (acceptShell) => {
        const stream = acceptShell()
        stream.on('data', (data) => {
          const argv = parseArgv(data.toString().trim())
          if (argv[0] === 'bin') {
            const result = bin(argv)
            if (result.stdout) {
              stream.write(result.stdout)
            }
            if (result.stderr) {
              stream.stderr.write(result.stderr)
            }
            stream.exit(result.stderr)
            stream.end()
          } else {
            stream.stderr.write('Command not recognized')
            stream.exit(1)
            stream.end()
          }
        })
      })
    })
  })

  const address = ip.address()
  const port = await getPort()
  
  return new Promise((resolve) => {
    server.listen(port, address, () => {
      resolve({
        server,
        settings: {
          hostname: address,
          username: 'fabula',
          passphrase,
          privateKey,
          port
        }
      })
    })
  })
}
