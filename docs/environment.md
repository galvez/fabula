# Environment

Environment variables can bet set in various ways.

## Global

To set environment variables globally for both local and remote settings, 
assign keys to the `env` object in **Fabula**'s configuration file:

```js
export default {
  env: {
    FOOBAR: 'foobar'
  }
}
```

Note, however, that the keys `local` and `ssh` are reserved.

## Local

Use `env.local` in **Fabula**'s configuration file (`fabula.js`):

```js
export default {
  env: {
  	local: {
      FOOBAR: 'foobar'
    }
  }
}
```

## Remote

Use `env.ssh` in **Fabula**'s configuration file (`fabula.js`):

```js
export default {
  env: {
  	ssh: {
      FOOBAR: 'foobar'
    }
  }
}
```

This sets environment variables for all remote servers. These variables are used
in **every remote command**, from any **Fabula** task file.

## Per server

You may also place `env` underneath each SSH server:

```js
export default {
  ssh: {
    server1: {
      hostname: '1.2.3.4',
      privateKey: '/path/to/key',
      env: {
        FOOBAR: 'foobar'
      }
    }
  }
}
```

Environment variables set for a remote server are used for every command that
is ran on that server from any **Fabula** task file.

## Per component

```js
<fabula>
export default {
  env: {
    FOOBAR: 'foobar'
  }
}
</fabula>
```

Environment variables set in a **Fabula** component are only used for the
commands contained in it, both local and remote.
