import { writeFileSync, readFileSync } from 'fs'
import { spawnSync } from 'child_process'
import { resolve } from 'path'

const 
  opts = { cwd: resolve(__dirname, '../fixtures') },
  fabulaBin = resolve(__dirname, '../../bin/fabula.js'),
  spawnFabula = (...args) => spawnSync(fabulaBin, args, opts)

describe('test handling', () => {

  test('single handler', async () => {
    const { stdout, stderr } = spawnFabula('handler')
    console.log(stdout)
  })
})
