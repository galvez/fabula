import { writeFileSync, appendFileSync } from 'fs'
import { spawn } from 'child_process'

export function execLocal(cmd, env = {}) {
  return new Promise((resolve) => {
    let stdout = ''
    let stderr = ''
    const stream = spawn(...cmd, { env })
    stream.on('close', (code) => {
      resolve({ stdout, stderr, code })
    })
    stream.on('data', (data) => { stdout += data })
    stream.stderr.on('data', (data) => { stderr += data })
  })
}

export function localWrite(filePath, fileContents) {
  writeFileSync(filePath, fileContents)
}

export function localAppend(filePath, fileContents) {
  appendFileSync(filePath, fileContents)
}
