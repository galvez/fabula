
import { readFileSync } from 'fs'
import { exec } from 'child_process'
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

export async function runEcho(cmd) {
  const filePath = cmd[0]
  const match = cmd[1].match(/^\s+/)
  const indentation = match ? match[0].length : 0
  const dedented = cmd.slice(1).map(line => line.slice(indentation))
  const fileContents = dedented.join('\n')
  const stream = await conn.sftp().catch(reject)
  return stream.writeFile(filePath, fileContents).catch(reject)
}

export async function runPut(cmd) {
  const stream = await conn.sftp().catch(reject)
  return stream.fastPut(cmd).catch(reject)
}

export function runCommand(cmd) {
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

// const conn = await getConnection('my-server', {
//   host: '192.168.100.100',
//   port: 22,
//   username: 'username',
//   privateKey: '/here/is/my/key'
// })
