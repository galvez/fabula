<p align="center">
  <h1>⚙ fabula</h1>
  <span>Minimalist server configuration and task management</span>
</p>

#### **tasks/setup-gh-deploy.fab**

```sh
mkdir -p ~/.keys
chown -R deploy ~/.keys
chmod 755 ~/.keys

put <%= github.deployKey %> ~/.keys/deploy_key
chmod 400 ~/.keys/deploy_key

echo ~/.ssh/config:
  Host github.com
    Hostname github.com
    IdentityFile ~/.keys/deploy_key
    User git
    StrictHostKeyChecking no
 ```

#### **fabula.js**

```js
export default {
  server1: {
  	host: '1.2.3.4',
  	user: 'deploy',
  	privateKey: '/path/to/private-key'
  },
  github: {
  	deployKey: '/path/to/deploy-key'
  }
}

#### command line

```sh
fabula tasks/setup-gh-deploy.fab
fabula server1:tasks/setup-gh-deploy.fab
```

- First command will automatically run on all available servers.
- Second command will run specifically on `server1`

## Motivation

For the longest time, I have packaged my Node applications together with a 
[Fabric](https://www.fabfile.org/) installation for running SSH tasks. For 
those who don't know, Fabric allows you to write Python scripts for running 
commands [both locally and remote][fabric-ops], by specifying external servers 
and keys for SSH access. Below is a sample `Fabric` task:

[fabric-ops]: http://docs.fabfile.org/en/1.14/api/core/operations.html

```py
@task
def my_task():
    local('touch foobar')
    put('toobar', '/remote/path/foobar')
```

Fabric is my reference example, but nearly all other popular solutions in the 
same realm (`puppet`, `ansible`, `chef`, `terraform` etc) also require larger 
packages and a foreign architecture to be able to perform these operations. In
my case, I'd always need my `node_modules` **and** a [pip][pip] installation.

[pip]: https://pypi.org/project/pip/

Granted, these other packages are rather full-blown abstractions for server 
management and deployment, in contrast to Fabric which is architected more 
closely to the metal (SSH), _so to speak_. Fabric avoids abstracting too much, 
while offering the ability to compose low-level commands with easier 
configuration and a convenience transport layer independent from `ssh-agent`.

Given there's [a mature SSH2 package for Node][ssh2] available, I set out to 
write a Fabric and Nuxt inspired new tool, with a couple of twists:

[ssh2]: https://github.com/mscdex/ssh2

- Instead of using JavaScript for composing shell scripts, just preprocess bash
  scripts with [`lodash.template`][template] with some added conveniences, such 
  as `local <cmd>` and Pythonic blocks (`echo <path>:`), as exemplified in the
  example featured at the top.

- Offer an API for extending the preprocessor with your own commands. This is
  done by modularizing the bash parser with hooks. More on this below:

## Dissecting a sample Fabula script

```sh
# This script runs on the remote instance
# to add Github SSH configuration for deployment

# ~ is automatically expanded to $HOME
mkdir -p ~/.keys
chown -R ubuntu ~/.keys
chmod 755 ~/.keys

# put is a special command that performs a SFTP
# PUT operation from <source> to <target>, where
# <source> is a path on the local machine
put <%= github.deploy_key %> ~/.keys/deploy_key
chmod 400 ~/.keys/deploy_key

# echo is a special command that overrides the original 
# UNIX command with an indentation-based block to define 
# multi-line contents for a file, where the target path 
# is set on the first line, followed by a single colon to 
# indicate the start of the text block. The text is automatically 
# dedented to the number of white spaces on the first line
echo ~/.ssh/config:
  Host <%= host %>
    Hostname <%= hostname %>
    IdentityFile ~/.keys/deploy_key
    User git
    StrictHostKeyChecking no
```

Unless preceded by a **recognizable special command**, every line in script runs
on the server (just like Fabric's `run()`). Similarly, you can start a line with
`local` to indicate it should run on the local machine (Fabric's `local()`):

```sh

local append ~/.ssh/config:
  Host <%= host %>
    Hostname <%= hostname %>
    Port <%= port %>
    IdentityFile <%= privateKey %>
    StrictHostKeyChecking no
 ```

The example above will run the `append` **special command** locally. The very 
same `append` command can be used without `local`, which would make it run on 
the server by default.

The `<% %>` and `<%= %>` bits are the **first** to be preprocessed, via 
[`lodash.template`][template], which is essentially a _fast enough_ 
interpolation language that allows you to embed **any** JavaScript statement 
or control structure.

[template]: https://lodash.com/docs/4.17.11#template

## Special command handlers

To make the bash script parser as flexible and fault-tolerant as possible, 
`fabula` introduces a simple, straight-forward compiler with an API for writing 
command handlers. The special `put` built-in command for instance, is 
defined under `src/commands/put.js`:

```js
import { put } from '../ssh'

export default {
  name: 'put',
  match(line) {
    return line.trim().match(/^put\s+(.+)\s+(.+)/)
  },
  line() {
    this.params.sourcePath = this.match[1]
    this.params.targetPath = this.match[2]
  },
  command() {
    return put(this.conn, this.params.sourcePath, this.param.targetPath)
  }
}
```

- `match()` is called once for every new line, if no previous command is still 
  being parsed. If `match()` returns `true`, `line()` will run for the current 
  and every subsequent line as long as you keep returning `true`, which means,
  _continue parsing lines for the **current command**_. When `line()` returns 
  `false` or `undefined`, the compiler understands the current command is 
  **done parsing** and moves on.

- with `line()`, we can store data that is retrieved from each line in the 
  command block, make it availble under `this.params` and later access it when 
  actually calling `command()` (done automatically when running scripts).

### Advanced usage: echo and append

We can write a special command handler that interprets more than one similar 
command if it makes sense to do so. The proposed `append` and `echo` special 
commands perform very similar tasks, that is, allowing us to write a body of
text onto a file or appending to it. Its main idea is to perform automatically
**dedention** of the body, similar to YAML strings.

```sh
mkdir /tmp/files
<% for (const file of files) { %>
echo /tmp/files/<%= file %>:
  this is the content of <%= file %>
<% } %>
```

This will generate a script with three `echo` calls, all of which have their own respective bodies. As we write the handler for this command,  we also need to 
detect if it starts with `local`, and run the appropriate functions for local 
and remote commands. This is the code that handles them:

```js
import { echo, append } from '../ssh'
import { localEcho, localAppend } from '../local'

export default {
  name: 'write',
  match(line) {
    const argv = [...this.argv]
    if (argv[0] === 'local') {
      argv.shift()
      this.local = true
    }
    this.op = argv[0]
    this.dedent = 0
    if (['append', 'echo'].includes(argv[0])) {
      return line.trim().match(
        new RegExp(`^(?:local\\s*)?${argv[0]}\\s+(.+?):$`)
      )
    }
  },
  line(line) {
    if (this.firstLine) {
      this.params.filePath = this.match[1]
      this.params.fileContents = []
      return true
    } else if (!/^\s+/.test(line)) {
      return false
    } else {
      if (this.params.fileContents.length === 0) {
        const match = line.match(/^\s+/)
        if (match) {
          this.dedent = match[0].length
        }
      }
      this.params.fileContents.push(line.slice(this.dedent))
      return true
    }
  },
  command() {
    const filePath = this.params.filePath
    const fileContents = this.params.fileContents
    if (this.local) {
      const cmd = ({ echo: localEcho, append: localAppend })[this.op]
      return cmd({ filePath, fileContents })
    } else {
      return ({ echo, append })[this.op](this.conn, { filePath, fileContents })
    }
  }
}
```
