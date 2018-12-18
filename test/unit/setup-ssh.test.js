
import { readFileSync } from 'fs'
import {
  compileTemplate,
  compileAST
} from '../../src/index'

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

    const template = compileTemplate(templateFile, sampleSettings)
    const tree = compileAST(template)
    expect(JSON.stringify(tree, null, 2)).toMatchSnapshot()
  })
})
