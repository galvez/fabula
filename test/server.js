import fs from 'fs'
import { resolve } from 'fs'
import crypto from 'crypto'
import buffersEqual from 'buffer-equal-constant-time'
import ssh2 from 'ssh2'
import ip from 'ip'
import getPort from 'get-port'

function genPublicKey() {
  const pubKey = fs.readFileSync(resolve(__dirname, 'fixtures', 'keys', 'ssh.public'))
  return ssh2.genPublicKey(ssh2.parseKey(pubKey))
}

function authenticateSession(ctx) {
  const pubKey = genPublicKey()
  if (ctx.method === 'password') {
    ctx.reject()
  } else if (
    ctx.method === 'publickey'
    && ctx.key.algo === pubKey.fulltype
    && buffersEqual(ctx.key.data, pubKey.public)
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

function getServerSession() {
  const
    privateKey = resolve(__dirname, 'fixtures', 'keys', 'ssh.private'),
    hostKeys = [fs.readFileSync(privateKey)]

  return new Promise((resolve) => {
    const server = new ssh2.Server({ hostKeys }, (client) => {
      client.on('authentication', authenticateSession)
      resolve({ server, client })
    })
  })
}

function launchTestSSHServer () {
  const { server, client } = await getServerSession()

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

  const address = ip.address()
  const port = await getPort()
  
  return new Promise((resolve) => {
    server.listen(port, address, () => resolve({
      privateKey: resolve(__dirname, 'fixtures', 'keys', 'ssh.private'),
      hostname: address,
      port
    }))
  })
}
