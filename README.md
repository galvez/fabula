<p align="center">
  <h1>⚙ Fabula</h1>
  <img src="https://badge.fury.io/js/fabula.svg"><br>
  <span>Minimalist server configuration and task management.</span>
</p>

# Introduction

At its core, **Fabula** is a simple Bash script preprocessor and runner. It lets
you run scripts **locally** and on **remote servers**. **Fabula** (latin for 
_story_) is inspired by Python's [Fabric][f].

```sh
local echo "This runs on the local machine"
echo "This runs on the server"
```

If you place the above snippet in a file named `echo.fab` and configure a remote
server in Fabula's configuration file (`fabula.js`):

```js
export default {
  ssh: {
    server: {
      hostname: '1.2.3.4',
      username: 'user',
      privateKey: '/path/to/key'
    }
  }
}
```

Executing `fabula server echo` will run the script on `server` (as specified 
under `ssh` in `fabula.js`), but every command preceded by `local` will run 
on the local machine.

Please refer to the [full documentation][docs].

[docs]: https://github.io/fabula/

## Meta

Created and maintained by [Jonas Galvez][jg] with the help of the **Nuxt Core Team**.

<img width="104" alt="screen shot 2018-12-24 at 8 35 05 pm" src="https://user-images.githubusercontent.com/12291/50407303-987b3180-07bb-11e9-80b8-9609f99023dc.png">

Proudly sponsored by [STORED][stored], which provides state-of-the-art e-commerce solutions in Brazil.

[jg]: http://hire.jonasgalvez.com.br
[stored]: http://stored.com.br
