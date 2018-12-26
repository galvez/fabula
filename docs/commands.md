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

Text will be automatically dedented to the number of total white
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
local write /path/to/file:
  multi-line contents
  to be written to the file
```

## Put

Copies file in path from the local machine to path on the remote server.

> Availability: `remote`

```sh
put /path/to/local/file /path/on/remote/server
```

## Custom

To make the bash script parser as flexible and fault-tolerant as possible, 
`fabula` introduces a simple, straight-forward compiler with an API for writing 
command handlers. The special `put` built-in command for instance, is 
defined under `src/commands/put.js`:

```js
import { put } from '../ssh'

export default {
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

## Registration

Say you want to register the command `special <arg>`, that can run only on the
local machine. You can add a custom command handler to your `fabula.js`
configuration file under `commands`:

```js
export default {
  commands: [
    {
      match(line) {
        this.local = true
        const match = line.trim().match(/^special\s+(.+)/)
        this.params.arg = match[1]
        return match
      },
      command(conn) {
        return { stdout: `From special command: ${this.params.arg}!` }
      }
    }
  ]
}
```

Note that you could also use an external module:

```js
import specialCommand from './customCommand'

export default {
  commands: [ specialCommand ]
}
```

If you have a `task.fab` file with `special foobar`, its output will be:

```sh
ℹ [local] From special command: foobar!
ℹ [local] [OK] special foobar
```

Note that you have successfuly defined a local command that can be ran without
being preceded by `local`. That is because you **manually** set it to `local`
in `match()`. You can use `match()` to determine if the command is local or not
and still make it work both ways. **Fabula**'s built-in `write` and `append` are
good examples of this and the subject of the next topic.

### Advanced example

```sh
local write /path/to/file:
  contents
local write /path/to/file string.id
write /path/to/file:
  contents
write /path/to/file string.id
local append /path/to/file:
  contents
local append /path/to/file string.id
append /path/to/file string.id
```

The snippet above contains commands that are handled by [the same internal Fabula
code](https://github.com/nuxt/fabula/blob/master/src/commands/write.js). Let's 
take a quick dive into how it works.

```js
export default {
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
```

First we importing all necessary dependencies and define `match()`, which uses 
two kinds of patterns for matching the command: one is for dedented blocks of 
text (`patterns.block`) and other for string references (`patterns.string`).
`match()` also sets the `local` attribute for the command.

```js
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
```

The magic happens in `line()`, which will continue parsing the command in 
subsequent lines if it's a block of text, or use the provided string reference.
For convenience, we store the provided text in either `fileLines` or `fileBody`,
which are then retrieved by `command()`.

```js
  command(conn) {
    const filePath = this.params.filePath
    if (this.local) {
      const fileContents = this.string
        ? this.params.fileBody.split('\n')
        : this.params.fileLines
      const cmd = ({ write: localWrite, append: localAppend })[this.op]
      return cmd(filePath, fileContents)
    } else {
      const fileContents = this.string
        ? this.params.fileBody
        : this.params.fileLines.join('\n')
      return ({ write, append })[this.op](conn, filePath, fileContents)
    }
  }
}
```

As **Fabula** evolves, the code for this command and underlying functions it 
calls will likely change, but the API for defining and parsing the commands is
likely to stay the same as dissecated in this article.
