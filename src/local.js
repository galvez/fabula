import { promisify } from 'util'
import { exec } from 'child_process'
import { quote } from 'shell-quote'

export const execLocal = promisify(exec)

export async function localEcho({ filePath, fileContents }) {
  await exec(`echo -e ${quote(fileContents[0])} > ${filePath}`)
  for (const line of fileContents.slice(1)) {
    await exec(`echo -e ${quote(line)} >> ${filePath}`)
  }
}

export async function localAppend({ filePath, fileContents }) {
  for (const line of fileContents.slice(1)) {
    await exec(`echo -e ${quote(line)} >> ${filePath}`)
  }
}
