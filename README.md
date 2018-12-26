<p align="center">
  <h1>⚙ Fabula</h1>
  <span>Minimalist server configuration and task management.</span>
</p>



### SSH

So far we've only seen local commands. Anything **that is not preceded** by 
**`local`** is recognized to be a remote command. That is, they'll run on one
or more SSH servers that you can specify in **Fabula**'s configuration file.

> **Fabula** will recognize `fabula.js`, `fabularc.js` and `.fabularc.js` as
valid configuration filenames, in that order.

To specify a remote server, list it by a key under the `ssh` global option:

```js
export default {
  ssh: {
    server: {
      username: 'ubuntu',
      hostname: '1.2.3.4',
      privateKey: '/path/to/key'
    }
  }
}
```

To run a remote command, you need specify a list of servers. If you try to run
a **Fabula** file that contains a remote command without specifying any servers
where to run, it will exit and display an error. 

In the beggining you saw **Fabula** files with multiple sections organized as 
tags, but you can also skip the sections and just have your commands in a 
**Fabula** file. Say you have a `show-uptime.fab` file with simply:

```sh
uptime
```

To run it on the SSH server specified as `server` above, run:

```sh
fabula server show-uptime
```

<img width="756" alt="screen shot 2018-12-25 at 10 28 45 am" src="https://user-images.githubusercontent.com/12291/50422213-a66a9a00-082f-11e9-8342-2b4198d26aa3.png">

That would be the same as running:

```sh
fabula all show-uptime
```

If there are, however, multiple servers and you need to choose, you can do:


```sh
fabula server1,server2,server3 show-uptime
```

Notice that **Fabula** will ask for a passphrase if you don't provide one (as 
`passphrase`) in the connection settings in conjunction with `privateKey`. You 
can also skip providing a `privateKey` by linking to the local SSH agent:

```js
export default {
  ssh: {
    server: {
      username: 'ubuntu',
      hostname: '1.2.3.4',
      agent: process.env.SSH_AUTH_SOCK
    }
  }
}
```

See the **full documentation** (coming soon) for more.

## Meta

Created and maintained by [Jonas Galvez][jg] with the help of the **Nuxt Core Team**.

<img width="104" alt="screen shot 2018-12-24 at 8 35 05 pm" src="https://user-images.githubusercontent.com/12291/50407303-987b3180-07bb-11e9-80b8-9609f99023dc.png">

Proudly sponsored by [STORED][stored], which provides state-of-the-art e-commerce solutions in Brazil.

[jg]: http://hire.jonasgalvez.com.br
[stored]: http://stored.com.br
