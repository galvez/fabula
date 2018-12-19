
import { readFileSync } from 'fs'
import { runEcho } from '../../src/ssh'

describe('task commands', () => {
//  test('local command', () => {
//
//  })
//
//  test('remote command', () => {
//
//  })
//
//  test('put command', () => {
//
//  })
  test('echo command', () => {
    const cmd = [
      '$HOME/.ssh/config', [
        '  Host 192.168.100.100',
        '    Hostname my-server',
        '    Port 22',
        '    IdentityFile $HOME/.keys/deploy_key',
        '    User username',
        '    StrictHostKeyChecking no'
      ]
    ]
    const parsed = runEcho.parseCommand(cmd)
    expect(JSON.stringify(parsed, null, 2)).toMatchSnapshot()
  })
})
