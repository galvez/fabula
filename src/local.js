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
      }

    const stream = spawn(...cmd, options)
    stream.on('error', (err) => resolve(err))
    stream.stdout.on('data', (data) => { stdout += data })
    stream.stderr.on('data', (data) => { stderr += data })
    stream.on('exit', (code) => {
      resolve({ stdout, stderr, code })
    })
  })
}

export function localWrite(filePath, fileContents) {
  try {
    writeFileSync(filePath, fileContents)
    return { code: 0 }
  } catch (err) {
    return { code: 1, stderr: err.message || err.toString() }
  }
}

export function localAppend(filePath, fileContents) {
  try {
    appendFileSync(filePath, fileContents)
    return { code: 0 }
  } catch (err) {
    return { code: 1, stderr: err.message || err.toString() }
  }
}
