# Authentication

To configure access for servers, you must either ensure your local `ssh-agent` 
is running, or provide custom authentication settings for each server. If using
an encrypted key, providing `privateKey` in addition to `hostname` and 
`username` usually suffices (`port` can also be set and defaults to `22`):

## Private key

```js
export default {
  ssh: {
  	server: {
      hostname: '1.2.3.4',
      privateKey: '/path/to/key'
  	}
  }
}
```

Setting `privateKey` will skip `ssh-agent` and the authentication will be 
handled by **Fabula**. If you're using an encrypted key, you can provide the
`passphrase` option, or you'll be automatically prompted for one when a task 
runs (recommended for safety).

## SSH agent

If you fail to provide `privateKey`, **Fabula** will assume it should use the 
local `ssh-agent` and **will automatically use `process.env.SSH_AUTH_SOCK`**. 

You can override it by setting `agent` in `fabula.js`:

```js
export default {
  agent: process.env.CUSTOM_SSH_AUTH_SOCK,
  ssh: {
  	server: {
      hostname: '1.2.3.4',
  	}
  }
}
```
