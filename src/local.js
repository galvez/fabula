import { writeFileSync, appendFileSync } from 'fs'
import { spawn } from 'child_process'

export function execLocal(cmd, env = {}, cwd = null) {
  return new Promise((resolve) => {
    let
      stdout = ''

    let stderr = ''
    const
      options = {
        env: { ...process.env, ...env },
        cwd: cwd || process.cwd()
      }

    const stream = spawn(...cmd, options)

    stream.on('error', (err) => {
      resolve(err)
    })
    stream.stdout.on('data', (data) => { stdout += data })
    stream.stderr.on('data', (data) => { stderr += data })
    stream.on('exit', (code) => {
      resolve({ stdout, stderr, code })
    })
  })
}

export function localWrite(filePath, fileContents) {
  writeFileSync(filePath, fileContents)
}

export function localAppend(filePath, fileContents) {
  appendFileSync(filePath, fileContents)
}
