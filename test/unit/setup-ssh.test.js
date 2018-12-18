
// const sampleSettings = {
//   hostname: 'my-server',
//   host: '192.168.100.100',
//   port: 22,
//   username: 'username',
//   privateKey: '/here/is/my/key'
// }

// if (require.main === module) {
//   const template = compileTemplate(readFileSync('test/fixtures/setup-ssh.sh'), sampleSettings)
//   const tree = compileAST(template)
//   console.log('AST:')
//   console.log(tree)
//   const commands = commandsFromAST(tree)
//   console.log()
//   console.log('Command tree:')
//   console.log(commands.map(cmd => cmd.toString()))
// }
