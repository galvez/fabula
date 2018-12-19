
import { readFileSync } from 'fs'
import { compileCommand } from '../util'

describe('task compilation', () => {

  test('create-setup.sh', () => {

    const templateFile = readFileSync('test/fixtures/setup-ssh.sh')

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
