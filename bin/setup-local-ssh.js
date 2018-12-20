
const { runString } = require('../src/index')

const settings = {
  host: 'stored',
  username: 'ubuntu',
  hostname: '3.80.152.37',
  privateKey: '~/Keys/galvez'
}

runString(settings, `
cd ~
put foo bar
`)

// runString(settings, `
// local append ~/.ssh/config2:
//   Host <%= host %>
//     Hostname <%= hostname %>
//     IdentityFile <%= privateKey %>
// `)
