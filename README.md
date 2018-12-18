<p align="center">
  <h1>⚙ nuxt/operations</h1>
  <span>Nuxt.js server configuration and task management framework</span>
</p>

Write server deployment scripts the Nuxt way.

## Development

Currently you can:

```sh
yarn install
node -r esm src/index.js
```

And you'll get:

```
AST:
[ 'rm -rf /instance $HOME/.keys $HOME/.ssh/config',
  'mkdir -p /instance/ $HOME/.keys',
  'chown -R ubuntu /instance/ $HOME/.keys',
  'chmod 755 $HOME/.keys',
  [ 'put', [ '/my/key $HOME/.key', '/deploy_key' ] ],
  'chmod 400 $HOME/.keys/deploy_key',
  [ 'echo',
    '$HOME/.ssh/config',
    [ '  Host 192.168.100.100',
      '    Hostname my-server',
      '    Port 22',
      '    IdentityFile $HOME/.keys/deploy_key',
      '    User username',
      '    StrictHostKeyChecking no' ] ] ]

Command tree:
[ '() => runCommand(command)',
  '() => runCommand(command)',
  '() => runCommand(command)',
  '() => runCommand(command)',
  '() => runPut(command)',
  '() => runCommand(command)',
  '() => runEcho(command.slice(1))' ]
```

The testing code that prints the above reads as follows:

```js
const sampleSettings = {
  hostname: 'my-server',
  host: '192.168.100.100',
  port: 22,
  username: 'username',
  privateKey: '/here/is/my/key'
}

if (require.main === module) {
  const template = compileTemplate(readFileSync('test/fixtures/setup-ssh.sh'), sampleSettings)
  const tree = compileAST(template)
  console.log('AST:')
  console.log(tree)
  const commands = commandsFromAST(tree)
  console.log()
  console.log('Command tree:')
  console.log(commands.map(cmd => cmd.toString()))
}
```

## Proposed API

**nuxt.config.js**:

```js
export default {
  ops: {
    servers: {
      instance: {
        host: '192.168.100.100',
        port: 22,
        username: 'username',
        privateKey: readFileSync('/here/is/my/key')
      }
    }
  }
}
```

**server/tasks/setup-ssh**:

```sh
rm -rf /instance $HOME/.keys $HOME/.ssh/config
mkdir -p /instance/ $HOME/.keys
chown -R ubuntu /instance/ $HOME/.keys
chmod 755 $HOME/.keys
put <%= privateKey %> $HOME/.keys/deploy_key
chmod 400 $HOME/.keys/deploy_key

echo $HOME/.ssh/config:
  Host <%= host %>
    Hostname <%= hostname %>
    Port <%= port %>
    IdentityFile $HOME/.keys/deploy_key
    User <%= user %>
    StrictHostKeyChecking no
```

Run using [upcoming module commands](https://github.com/nuxt/nuxt.js/pull/4314):

```sh
nuxt ops run setup-ssh
```
