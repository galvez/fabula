<p align="center">
  <h1>⚙ nuxt/operations</h1>
  <span>Nuxt.js server configuration and task management framework</span>
</p>

Write server deployment scripts the Nuxt way.

**nuxt.configjs**:

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
put <%= config.instance.privateKey %> $HOME/.keys/deploy_key
chmod 400 $HOME/.keys/deploy_key

echo $HOME/.ssh/config:
  Host <%= config.instance.host %>
    Hostname <%= config.instance.name %>
    Port <%= config.instance.port %>
    IdentityFile $HOME/.keys/deploy_key
    User <%= config.instance.user %>
    StrictHostKeyChecking no
```

Run using [upcoming module commands](https://github.com/nuxt/nuxt.js/pull/4314):

```sh
nuxt ops run setup-ssh
```
