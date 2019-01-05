import { writeFileSync, appendFileSync } from 'fs'
import { spawn } from 'child_process'

export function execLocal(cmd, env = {}, cwd = null) {
  return new Promise((resolve) => {
    let
      stdout = '',
      stderr = ''
    const 
      options = {
        env: { ...process.env, ...env },
        cwd: cwd || process.cwd()
      },
      stream = spawn(...cmd, options)

    stream.on('error', (err) => {
      resolve(err)
    })
    stream.on('close', (code) => {
      resolve({ stdout, stderr, code })
    })
    stream.on('data', (data) => { stdout += data })
    if (stream.stderr) {
      stream.stderr.on('data', (data) => { stderr += data })
    }
  })
}

export function localWrite(filePath, fileContents) {
  writeFileSync(filePath, fileContents)
}

export function localAppend(filePath, fileContents) {
  appendFileSync(filePath, fileContents)
}
