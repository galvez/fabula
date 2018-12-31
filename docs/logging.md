# Logging

Logging can be configured in a fashion similar to environment variables: global,
local, remote, per server and per component.

[consola]: https://github.com/nuxt/consola

## Top level

```js
export default {
  logs: {
    global: 'logs/global.log',
    local: 'logs/local.log',
    ssh: 'logs/ssh.log'
  },
}
```

## Per server

```js
export default {
  ssh: {
    server1: {
      hostname: '1.2.3.4',
      username: 'serveruser',
      log: 'logs/ssh-server1.log'
    }
  }
}
```

## Per component

```js
<fabula>
export default {
  log: 'logs/component.log'
}
</fabula>
```
