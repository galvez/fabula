import { writeFileSync, appendFileSync } from 'fs'
import { promisify } from 'util'
import { exec } from 'child_process'

execLocal.exec = promisify(exec)

export function execLocal(cmd, env = {}) {
  return execLocal.exec(cmd, { env, shell: '/bin/bash' })
}

export function localWrite(filePath, fileContents) {
  writeFileSync(filePath, fileContents)
}

export function localAppend(filePath, fileContents) {
  appendFileSync(filePath, fileContents)
}
