<p align="center">
  <h1>⚙ nuxt/operations</h1>
  <span>Nuxt.js server configuration and task management framework</span>
</p>

Write server deployment scripts the Nuxt way.

## Development

- [x] local
- [ ] put
- [ ] run
- [ ] get (file)
- [ ] forward_local
- [ ] forward_remote
- [ ] https://gist.github.com/gcollazo/495372

```js
npm test
```

See `test/unit/basic.test.js` for now.

## Proposed API

**nuxt.config.js**:

```js
export default {
  operations: {
    servers: {
      instance: {
        // All properties here are available to the tasks templates
        host: '192.168.100.100',
        port: 22,
        username: 'username',
        privateKey: '/here/is/my/key'
      }
    }
  }
}
```

**tasks/setup-ssh**:

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
