import { spawnSync } from 'child_process'
import { resolve } from 'path'

const 
  logs = [
    'global-log.log',
    'local-log.log',
    'ssh-log.log',
    'server1-log.log',
    'server2-log.log'
  ].map((log) => {
    return resolve(__dirname, ...`../fixtures/logs/${log}.log`.split('/'))
  }),
  opts = { cwd: resolve(__dirname, '../fixtures') },
  fabulaBin = resolve(__dirname, '../../bin/fabula.js'),
  spawnFabula = (...args) => spawnSync(fabulaBin, args, opts)

describe('test cli', () => {

  test('logging test', async () => {
    const stream = spawnFabula('logging')
    console.log(stream.stdout.toString())
    console.log(stream.stderr.toString())
    // let stdout = ''
    // let stderr = ''
    // stream.on('data', (data) => { stdout += data })
    // stream.stderr.on('data', (data) => { 
    //   stderr += data
    // })
    // await new Promise((resolve) => stream.on('exit', () => resolve()))
    // console.log(stdout)
    // console.log(stderr)
    for (const log in logs) {
      writeFileSync(log, '')
    }
  })
})