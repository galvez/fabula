## Special command handlers

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
