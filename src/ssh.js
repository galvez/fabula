
import { readFileSync } from 'fs'
import { exec as execLocal } from 'child_process'
import { promisify } from 'util'
import { Client } from 'ssh2'

const execAsync = promisify(exec)
export const connections = {}

export function getConnection(server, settings) {
  return new Promise((resolve, reject) => {
    if (!connections[server]) {
      const conn = new Client()
      connections[server] = conn
      conn.exec = promisify(conn.exec).bind(conn)
      conn.sftp = promisify(conn.sftp).bind(conn)
    }
    conn.on('error', reject)
    conn.on('ready', () => resolve(conn))
    conn.connect({
      ...settings,
      privateKey: readFileSync(privateKey).toString()
    })
  })
}

export function runLocalCommand(cmd) {
  return execAsync(cmd)
}

export async function echo({ filePath, fileContents }) {
  const stream = await conn.sftp()
  return stream.writeFile(filePath, fileContents)
}

export async function append({ filePath, fileContents }) {
  // escape string
  // run echo escaped(fileContents) >> filePath on the server
}

export async function put(cmd) {
  const stream = await conn.sftp()
  return stream.fastPut(cmd)
}

export function exec(cmd) {
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
