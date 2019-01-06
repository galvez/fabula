import { writeFileSync, readFileSync } from 'fs'
import { spawnSync } from 'child_process'
import { resolve } from 'path'

const 
  logs = [
    'global',
    'local',
    'ssh',
    'server1',
    'server2'
  ].reduce((obj, log) => {
    const logPath = `../fixtures/logs/${log}-log.log`.split('/')
    return { ...obj, [log]: resolve(__dirname, ...logPath) }
  }, {}),
  opts = { cwd: resolve(__dirname, '../fixtures') },
  fabulaBin = resolve(__dirname, '../../bin/fabula.js'),
  spawnFabula = (...args) => spawnSync(fabulaBin, args, opts)

function extractMsg(line) {
  return JSON.parse(line).args.join(' ')
}

function extractLogs(stdout, stderr) {
  stdout = stdout.split(/\n/)
  stderr = stderr.split(/\n/)
  return {
    global: stdout,
    local: stdout.filter(line => line.match(/\[local\]/)),
    ssh: stdout.filter(line => line.match(/\[server\d\]/)),
    server1: stdout.filter(line => line.match(/\[server1\]/)),
    server2:  stdout.filter(line => line.match(/\[server2\]/)),
  }
}

describe('test cli', () => {
  beforeAll(() => {
    Object.keys(logs).forEach((log) => {
      writeFileSync(logs[log], '')
    })
  })

  test('logging test', async () => {
    const { stdout, stderr } = spawnFabula('all', 'logging')
    const output = extractLogs(
      stdout.toString().trim(),
      stderr.toString().trim()
    )
    const compareLogs = (raw, msg) => {
      raw.split(/\n/).forEach((line, i) => {
        expect(msg[i]).toContain(extractMsg(line))
      })
    }
    for (const log in logs) { 
      compareLogs(readFileSync(logs[log]).toString().trim(), output[log])
    }
  })
})
