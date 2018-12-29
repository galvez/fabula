
import { resolve } from 'path'
import { readFileSync } from 'fs'
import { compileForTest } from '../compile'

describe('test preprocessor syntax', () => {

  test('simple', () => {
    const testPath = resolve(__dirname, '..', 'fixtures', 'simple')
    const result = compileForTest(testPath)
    console.log(result)
    expect(result).not.toBe(undefined)
  })

  // test('advanced', () => {
  //   const testPath = resolve(__dirname, '..', 'fixtures', 'advanced')
  //   const result = compileForTest(testPath)
  //   console.log(result)
  //   expect(result).not.toBe(undefined)
  // })

})
