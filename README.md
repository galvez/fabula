<p align="center">
  <h1>⚙ Fabula</h1>
  <span>Minimalist server configuration and task management.</span>
</p>

### 2-Minute Intro

Let's start with the simplest of tasks:

> add an entry to `~/.ssh/config` on your **local computer**. 

First, we'll define some parameters we'll use:

```xml
<fabula>
export default {
  host: 'server',
  hostname: '1.2.3.4',
  username: 'ubuntu',
  privateKey: '/path/to/key'
}
</fabula>
```

The `<fabula>` block should contain an **ES module**.

Next we can add a `local append` command to the `<commands>` section:

```xml
<fabula>
export default {
  host: 'server',
  hostname: '1.2.3.4',
  username: 'ubuntu',
  privateKey: '/path/to/key'
}
</fabula>

<commands>
# Append a new line
local echo >> ~/.ssh/config

# Append specified block of text
local append ~/.ssh/config:
  Host <%= host %>
      Hostname <%= hostname %>
      User <%= user %>
      IdentityFile <%= privateKey %>
      StrictHostKeyChecking no
</commands>
```

Any Bash statement will work inside `<commands>` (like the first one), but a few
particular statements are recognized by handlers using **Fabula**'s modular 
compiler API, which cause them to process and run differently. 

First off, anything line that starts with `local` is run on the local machine.

In this snippet, we're using Fabula's special `append` command, which allows you 
to define an **indented block of text** (that gets **automatically dedendeted** 
when parsed) and append it to a file. 

Similarly, `local write` would overwrite the contents of the file, instead of 
simply appending to it. As minimalist and useful as these blocks of inline text 
can be (way prettier than using native Bash at least), they can still be kind of
funky for some people.

**Fabula** offers yet another alternative to this case, which is to add a 
`<string>` block with an identifier, that can later be referenced by an 
alternatively recognizable syntax for the special `local append` command:

```xml
<fabula>
export default {
  host: 'server',
  hostname: '1.2.3.4',
  username: 'ubuntu',
  privateKey: '/path/to/key'
}
</fabula>

<string id="sshConfig">
Host <%= host %>
    Hostname <%= hostname %>
    User <%= username %>
    IdentityFile <%= privateKey %>
    StrictHostKeyChecking no
</string>

<commands>
# Append a new line
local echo >> ~/.ssh/config

# Append specified string
local append ~/.ssh/config strings.sshConfig
</commands>
```

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

That would be the same as running:

```sh
fabula all show-uptime
```

If there are, however, multiple servers and you need to choose, you can do:


```sh
fabula server1,server2,server3 show-uptime
```

See the **full documentation** (coming soon) for more.

## Meta

Created and maintained by [Jonas Galvez][jg] with the help of the **Nuxt Core Team**.

<img width="104" alt="screen shot 2018-12-24 at 8 35 05 pm" src="https://user-images.githubusercontent.com/12291/50407303-987b3180-07bb-11e9-80b8-9609f99023dc.png">

Proudly sponsored by [STORED][stored], which provides state-of-the-art e-commerce solutions in Brazil.

[jg]: http://hire.jonasgalvez.com.br
[stored]: http://stored.com.br