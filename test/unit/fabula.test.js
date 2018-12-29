
import { resolve } from 'path'
import { readFileSync } from 'fs'
import { compileForTest } from '../compile'

const results = {}
const fixture = (f) => resolve(__dirname, '..', 'fixtures', f[0])

describe('test preprocessor syntax', () => {

  beforeAll(() => {
    results.simple = compileForTest(fixture`simple`)
    results.advanced = compileForTest(fixture`advanced`)
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

  test('write /tmp/test: <block>', () => {
    expect(results.advanced[2].local).toBe(false)
    expect(results.advanced[2].source[0]).toBe('write /tmp/test:')
    expect(results.advanced[2].source[1]).toBe('  goes into the file')
    expect(results.advanced[2].params.filePath).toBe('/tmp/test')
    expect(results.advanced[2].params.fileContents).toBe('goes into the file')
  })

  test('write /tmp/file2 <ref>', () => {
    expect(results.advanced[5].local).toBe(true)
    expect(results.advanced[5].source[0]).toBe('local write /tmp/file2 files[1].contents')
    expect(results.advanced[5].params.filePath).toBe('/tmp/file2')
    expect(results.advanced[5].params.fileContents).toBe('Contents \' of file2')
  })

  test('local echo <string-with-newline> > /tmp/file1"', () => {
    expect(results.advanced[6].local).toBe(true)
    expect(results.advanced[6].source[0]).toBe(`local echo 'Contents \\nof file1' > /tmp/file1`)
    expect(results.advanced[6].params.cmd).toBe(`echo 'Contents \\nof file1' > /tmp/file1`)
  })

  test('local echo <string-with-quote> > /tmp/file2"', () => {
    expect(results.advanced[7].local).toBe(true)
    expect(results.advanced[7].source[0]).toBe(`local echo 'Contents '"'"' of file2' > /tmp/file2`)
    expect(results.advanced[7].params.cmd).toBe(`echo 'Contents '"'"' of file2' > /tmp/file2`)
  })

  test('gcloud container clusters create my-cluster <multline-options>', () => {
    expect(results.advanced[8].local).toBe(false)
    expect(results.advanced[8].source[0]).toBe(
      'gcloud container clusters create my-cluster --machine-type=n1-standard-2 --zone=southamerica-east1-a --num-nodes=4'
    )
    expect(results.advanced[8].params.cmd).toBe(
      'gcloud container clusters create my-cluster --machine-type=n1-standard-2 --zone=southamerica-east1-a --num-nodes=4'
    )
  })
})
