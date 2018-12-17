
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join, resolve, parse } from 'path'
import klawSync from 'klaw-sync'
import defaults from './defaults'

const resolvePath = (...args) => resolve(__dirname, ...args)

export default function (ctx) {
  const base = this.options.srcDir
  const servers = ctx.servers
}
