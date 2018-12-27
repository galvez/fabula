
import { readFileSync } from 'fs'
import { promisify } from 'util'
import consola from 'consola'
import read from 'read'
import { Client } from 'ssh2'

function exit(err) {
  consola.fatal(err.message || err)
  process.exit()
}

async function exitOnError(promise) {
  try {
    return await promise()
  } catch (err) {
    consola.fatal(err.message || err)
    process.exit()
  }
}

function askPassphrase(privateKey) {
  return new Promise((resolve) => {
    const prompt = {
      prompt: `${privateKey} requires a passphrase: `,
      silent: true,
      replace: '*'
    }
    read(prompt, (_, passphrase) => {
      resolve(passphrase)
    })
  })
}

function isKeyEncrypted(privateKey) {
  if (/^-*BEGIN ENCRYPTED PRIVATE KEY/g.test(privateKey)) {
    return true
  } else {
    const firstLines = privateKey.split(/\n/g).slice(0, 2)
    return firstLines.some(line => line.match(/Proc-Type: 4,ENCRYPTED/))
  }
}

export function getConnection(settings) {
  return new Promise(async (resolve, reject) => {
    const conn = new Client()
    conn.exec = promisify(conn.exec).bind(conn)
    conn.sftp = promisify(conn.sftp).bind(conn)
    conn.on('error', exit)
    conn.on('ready', () => {
      conn.settings = settings
      resolve(conn)
    })

    let connect
    if (settings.privateKey) {
      const privateKey = readFileSync(settings.privateKey).toString()
      if (!settings.passphrase && isKeyEncrypted(privateKey)) {
        settings.passphrase = await askPassphrase(settings.privateKey)
      }
      connect = () => conn.connect({ ...settings, privateKey })
    } else {
      if (!settings.agent) {
        settings.agent = process.env.SSH_AUTH_SOCK
      }
      connect = () => conn.connect({ ...settings })
    }
    await exitOnError(connect)
  })
}

export async function write(conn, filePath, fileContents) {
  const stream = await conn.sftp()
  return exitOnError(() => stream.writeFile(filePath, fileContents))
}

export async function append(conn, filePath, fileContents) {
  const stream = await conn.sftp()
  return exitOnError(() => stream.appendFile(filePath, fileContents))
}

export async function get(conn, remotePath, localPath) {
  const stream = await conn.sftp()
  return exitOnError(() => stream.fastGet(remotePath, localPath))
}

export async function put(conn, localPath, remotePath) {
  const stream = await conn.sftp()
  return exitOnError(() => stream.fastPut(localPath, remotePath))
}

export function exec(conn, cmd) {
  return new Promise(async (resolve, reject) => {
    let stdout = ''
    let stderr = ''
    const stream = await exitOnError(() => conn.exec(cmd))
    stream.on('close', (code, signal) => {
      resolve({ stdout, stderr, code, signal })
    })
    stream.on('data', (data) => { stdout += data })
    stream.stderr.on('data', (data) => { stderr += data })
  })
}
