import { promisify } from 'util'
import { exec } from 'child_process'
import { quote } from './utils'

execLocal.exec = promisify(exec)

export function execLocal(cmd) {
  return execLocal.exec(cmd, {shell: '/bin/bash'})
}

export async function localEcho({ filePath, fileContents }) {
  await execLocal(`echo -e ${quote(fileContents[0])} > ${filePath}`)
  for (const line of fileContents.slice(1)) {
    await execLocal(`echo ${quote(line)} >> ${filePath}`)
  }
}

export async function localAppend({ filePath, fileContents }) {
  for (const line of fileContents) {
    await execLocal(`echo -e ${quote(line)} >> ${filePath}`)
  }
}
