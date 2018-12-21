
import { readFileSync } from 'fs'
import { compileCommand } from '../util'

describe('test preprocessor syntax', () => {

  test('simple', () => {

    const testPath = resolve(__dirname, '..', 'fixtures', 'syntax', 'simple')
    const result = runScriptTest(testPath)
    console.log(result)
    expect(result).toNotBe(undefined)
  })

})
