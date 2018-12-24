
import { readFileSync } from 'fs'
import { promisify } from 'util'
import { Client } from 'ssh2'

function isKeyEncrypted(privateKey) {
  if (/^-*BEGIN ENCRYPTED PRIVATE KEY/g.test(privateKey)) {
    return true
  } else {
    const firstLines = privateKey.split(/\n/g).slice(0, 3)
    return firstLines.some((line) => line.match(/Proc-Type: 4,ENCRYPTED/))
  }
}

export function getConnection(settings) {
  return new Promise((resolve, reject) => {
    const conn = new Client()
    conn.exec = promisify(conn.exec).bind(conn)
    conn.sftp = promisify(conn.sftp).bind(conn)
    conn.on('error', reject)
    conn.on('ready', () => resolve(conn))

    const privateKey = readFileSync(settings.privateKey).toString()
    if (!settings.passphrase && isKeyEncrypted(privateKey)) {

    }
    conn.connect({ ...settings, privateKey })
  })
}

export async function echo(conn, { filePath, fileContents }) {
  const stream = await conn.sftp()
  return stream.writeFile(filePath, fileContents)
}

export async function append(conn, { filePath, fileContents }) {
  // escape string
  // run echo escaped(fileContents) >> filePath on the server
}

export async function put(conn, cmd) {
  const stream = await conn.sftp()
  return stream.fastPut(cmd)
}

export function exec(conn, cmd) {
  return new Promise(async (resolve, reject) => {
    let stdout = ''
    let stderr = ''
    const stream = await conn.exec(cmd).catch(reject)
    stream.on('close', (code, signal) => {
      resolve({ stdout, stderr, code, signal })
    })
    stream.on('data', (data) => { stdout += data })
    stream.stderr.on('data', (data) => { stderr += data })
  })
}
