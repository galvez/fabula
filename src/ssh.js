
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
  const { filePath, fileContents } = runEcho.parseCommand(cmd)
  const stream = await conn.sftp().catch(reject)
  return stream.writeFile(filePath, fileContents).catch(reject)
}

runEcho.parseCommand = function(cmd) {
  const filePath = cmd[0]
  const match = cmd[1][0].match(/^\s+/)
  const indentation = match ? match[0].length : 0
  const dedented = cmd[1].map(line => line.slice(indentation))
  const fileContents = dedented.join('\n')
  return { filePath, fileContents }
}

export async function runPut(cmd) {
  const stream = await conn.sftp()
  return stream.fastPut(cmd)
}

export function runCommand(cmd) {
  let stdout = ''
  let stderr = ''
  try {
    const stream = await conn.exec(cmd)
    stream.on('data', (data) => { stdout += data })
    stream.stderr.on('data', (data) => { stderr += data })
    await new Promise((resolve) => {
      stream.on('close', (code, signal) => {
        resolve({ stdout, stderr, code, signal })
      })
    })
  } catch (err) {
    console.fatal(err)
  }
}
