import { promisify } from 'util'
import { Client } from 'ssh2'

let conn

export function getConnection(settings) {
  return new Promise((resolve, reject) => {
    if (!conn) {
      conn = new Client()
      conn.exec = promisify(conn.exec).bind(conn)
    }
    conn.on('error', reject)
    conn.on('ready', () => resolve(conn))
    conn.connect(settings)
  })
}

export function runCommand(cmd) {
  return new Promise(async (resolve, reject) => {
    let stdout
    let stderr
    const stream = await conn.exec(cmd).catch(reject)
    stream.on('close', (code, signal) => {
      resolve({ stdout, stderr })
    })
    stream.on('data', (data) => { stdout += data })
    stream.stderr.on('data', (data) => { stderr += data })
  })
}

// const conn = await getConnection({
//   host: '192.168.100.100',
//   port: 22,
//   username: 'username',
//   privateKey: readFileSync('/here/is/my/key')
// })
