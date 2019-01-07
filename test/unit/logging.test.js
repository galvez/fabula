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

function filterAndSummarize(lines, re) {
  return lines
    .filter(line => line.match(re))
    .map(line => line.replace(/\[[\d:]+\] /g, ''))
}

function extractLogs(stdout, stderr) {
  stdout = stdout.split(/\n/)
  stderr = stderr.split(/\n/)
  return {
    global: stdout.map(line => line.replace(/\[[\d:]+\] /g, '')),
    local: filterAndSummarize(stdout, /\[local\]/),
    ssh: filterAndSummarize(stdout, /\[server\d\]/),
    server1: filterAndSummarize(stdout, /\[server1\]/),
    server2:  filterAndSummarize(stdout, /\[server2\]/),
  }
}

describe('test logging', () => {

  test('all logs', async () => {
    await Promise.all(
      Object.keys(logs).map((log) => new Promise((resolve) => {
        writeFileSync(logs[log], '')
        resolve()
      }))
    )
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
