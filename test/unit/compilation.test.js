
import { readFileSync } from 'fs'
import { compileCommand } from '../util'

describe('task compilation', () => {

  test('write-files-local.sh', () => {

    const templateFile = readFileSync('test/fixtures/write-files-local.sh')

    const settings = {
      files: ['file1', 'file2', 'file3']
    }

    const compiled = compileCommand(templateFile, settings)
    console.log(compiled)
    expect(JSON.stringify(compiled, null, 2)).toMatchSnapshot()
  })

  test('create-setup.sh', () => {

    const templateFile = readFileSync('test/fixtures/setup-deployment.sh')

    const sampleSettings = {
      hostname: 'my-server',
      host: '192.168.100.100',
      port: 22,
      username: 'username',
      privateKey: '/here/is/my/key'
    }

    const compiled = compileCommand(templateFile, sampleSettings)
    expect(JSON.stringify(compiled, null, 2)).toMatchSnapshot()
  })
})
