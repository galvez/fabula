# Commands

As stated in the introduction, **every command available to the underlying Bash 
shell** will work in a **Fabula** task. There are however a few convenience 
commands that are specific to **Fabula**.

## Local

Every command preceded by `local` will run on the local machine:

```sh
local mkdir -p /tmp/foobar
local touch /tmp/foobar
```

## Append

Appends a block text or string to the file in the specified path.

> Availability: `local` and `remote`

### Simple use

```sh
local append /path/to/file:
  multi-line contents
  to be appended to the file 
```

Text will be automatically dedendeted to the number of total white
spaces in the **first line**.

### With string id

```sh
<fabula>
export default {
  path: '/path/to/file '
}
</fabula>

<commands>
local append <%= path %> strings.contents
</commands>

<string id="contents">
multi-line contents
to be appended to the file 
</string>
```

## Write

Writes a block text or string to the file in the specified path.

> Availability: `local` and `remote`

This command has essentially the same semantics of `append`, with the difference
that it will never append to, but rather overwrite the contents of the target entirely.


```sh
local write <%= path %>:
  multi-line contents
  to be written to the file
```

## Custom

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
  command(conn) {
    return put(conn, this.params.sourcePath, this.param.targetPath)
  }
}
```

- `match()` is called once for every new line, if no previous command is still 
  being parsed. If `match()` returns `true`, `line()` will run for the current 
  and every subsequent line as long as you keep returning `true`, which means,
  _continue parsing lines for the **current command**_.

- When `line()` returns  `false` or `undefined`, the compiler understands the 
  current command is **done parsing** and moves on.

- with `line()`, we can store data that is retrieved from each line in the 
  command block, make it availble under `this.params` and later access it when 
  actually calling `command()` (done automatically when running scripts).

### Advanced example

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
  patterns: {
    block: (argv) => {
      return new RegExp(`^(?:local\\s*)?${argv[0]}\\s+(.+?):$`)
    },
    string: (argv) => {
      return new RegExp(`^(?:local\\s*)?${argv[0]}\\s+([^ ]+?)\\s+([^ :]+?)$`)
    }
  },
  match(line) {
    const argv = [...this.argv]
    if (argv[0] === 'local') {
      argv.shift()
      this.local = true
    }
    this.op = argv[0]
    this.dedent = 0
    if (['append', 'write'].includes(argv[0])) {
      let match
      // eslint-disable-next-line no-cond-assign
      if (match = line.match(this.cmd.patterns.block(argv))) {
        this.block = true
        return match
      // eslint-disable-next-line no-cond-assign
      } else if (match = line.match(this.cmd.patterns.string(argv))) {
        this.string = true
        return match
      }
    }
  },
  line(line) {
    if (this.firstLine) {
      this.params.filePath = this.match[1]
      if (this.block) {
        this.params.fileLines = []
        return true
      } else if (this.string) {
        const settingsKey = this.match[2]
        // eslint-disable-next-line no-eval
        this.params.fileBody = eval(`this.settings.${settingsKey}`)
        return false
      }
      return true
    } else if (!/^\s+/.test(line)) {
      return false
    } else {
      if (this.params.fileLines.length === 0) {
        const match = line.match(/^\s+/)
        if (match) {
          this.dedent = match[0].length
        }
      }
      this.params.fileLines.push(line.slice(this.dedent))
      return true
    }
  },
  command(conn) {
    const filePath = this.params.filePath
    const fileContents = this.string
      ? this.params.fileBody.split('\n')
      : this.params.fileLines

    if (this.local) {
      const cmd = ({ echo: localEcho, append: localAppend })[this.op]
      return cmd({ filePath, fileContents })
    } else {
      return ({ echo, append })[this.op](conn, { filePath, fileContents })
    }
  }
}
```
