
import { resolve } from 'path'
import { readFileSync } from 'fs'
import { compileForTest } from '../compile'

const results = {}
const fixture = (f) => resolve(__dirname, '..', 'fixtures', f[0])

describe('test preprocessor syntax', () => {

  beforeAll(() => {
    results.simple = compileForTest(fixture`simple`)
  })

  test('cd +', () => {
    expect(results.simple[0].local).not.toBe(true)
    expect(results.simple[0].source[0]).toBe('cd ~')
    expect(results.simple[0].params.cmd).toBe('cd ~')
  })

  test('local mkdir -p foobar', () => {
    expect(results.simple[1].local).toBe(true)
    expect(results.simple[1].source[0]).toBe('local mkdir -p foobar')
    expect(results.simple[1].params.cmd).toBe('mkdir -p foobar')
  })

  test('local git checkout my-branch', () => {
    expect(results.simple[2].local).toBe(true)
    expect(results.simple[2].source[0]).toBe('local git checkout my-branch')
    expect(results.simple[2].params.cmd).toBe('git checkout my-branch')
  })

  test('git checkout my-branch-2', () => {
    expect(results.simple[3].local).not.toBe(true)
    expect(results.simple[3].source[0]).toBe('git checkout my-branch-2')
    expect(results.simple[3].params.cmd).toBe('git checkout my-branch-2')
  })

  test('local echo "foobarfobar" > foobar', () => {
    expect(results.simple[4].local).toBe(true)
    expect(results.simple[4].source[0]).toBe('local echo "foobarfobar" > foobar')
    expect(results.simple[4].params.cmd).toBe('echo "foobarfobar" > foobar')
  })

  // test('advanced', () => {
  //   const testPath = resolve(__dirname, '..', 'fixtures', 'advanced')
  //   const result = compileForTest(testPath)
  //   console.log(result)
  //   expect(result).not.toBe(undefined)
  // })

})
