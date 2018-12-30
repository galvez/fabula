# Components

Let's start with the simplest of tasks:

> Add an entry to `~/.ssh/config` on your **local computer**. 

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

Next we can add a `local` `append` command to the `<commands>` section:

```xml
<fabula>
export default {
  fail: false,
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

Save as `add-to-ssh.fab` and run with:

```sh
fabula add-to-ssh
```

## Settings

The `<fabula>` block should contain an **ES module**. The 
module can either export an object containing all settings, or an 
optionally async function that returns such an object.

<fabula>
export default async (fabula) => ({
  fail: false,
  host: 'server',
  hostname: '1.2.3.4',
  username: await fabula.prompt('Username:'),
  privateKey: await fabula.prompt('Private key:'),
})
</fabula>

## Syntax

Any Bash statement will work inside `<commands>` (like the first one), but a 
few others are recognized by handlers using **Fabula**'s modular commands API, 
which cause them to process differently. 

As stated before, any line that starts with `local` is ran on the local 
machine. But in this snippet, we're also using Fabula's special `append` command, 
which allows you to define an **indented block of text** (that gets 
**automatically dedented** when parsed) and append it to a file. 

Similarly, `local` `write` `...` would overwrite the contents of the 
file, instead of simply appending to it. Both `append` and `write` are special
commands provided by **Fabula**.

## Prepend

You can append a command within the `<commands>` tag to automatically prepepend 
it every command within the block. Note that `sudo` is never prepended to 
**special** or **custom** commands, because those run under the same permission
as the **Fabula** task is running on.

```xml
<commands local sudo>
apt update -y
apt install nginx -y
write /tmp/file:
  test contents
</commands>
```

Would be interpreted as:

```xml
<commands>
local sudo apt update -y
local sudo apt install nginx -y
local write /tmp/file:
  test contents
</commands>
```

## Strings

As simple as these blocks of inline text can be (way 
prettier than using native Bash at least), they can still be kind of funky for 
some people. **Fabula** offers yet another alternative to this case, which is 
to add a `<string>` block with an identifier, that can later be referenced by
an alternatively recognizable syntax for the special `append` command:

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

Notice that in this case `local append ~/.ssh/config ` is not followed by a 
colon and block of text, but rather `strings.sshConfig`. 

Every string block is made available internally in the global settings object 
as `strings.$id`, which in this case, is referenced internally by the 
`append` command handler.

### Dedent modifier

You can force dedention of text to the number of total white spaces in the first line by appending the `dedented` modifier.

```xml  
<string id="config" dedented>
  White space at the beginning will be removed.
</string>
```

Learn more about commands and custom commands [in the next section](/commands.html).

## Chaining

Since a **Fabula** component may itself run other components, you may want to 
pass the settings and context of the parent component down to its children.

Use a dot as second parameter to `fabula` to do so:

```xml
<commands>
fabula . tasks/another-task
fabula . tasks/some-other-task
</commands>
```

When `tasks/another-task` runs, all settings from the caller component will be
merged with its own settings -- the latter having precedence. 

Alternatively, you may also use the **Fabula** component's settings function, 
as discussed earlier in this section. The default handler will run before any commands and also allow you to **access its parent settings and current 
execution state** through its **second and third** arguments:

```xml
<fabula>
export default (fabula, settings, commands) => {
  consola.info('Commands ran so far:', state.commands.length)
  return { ...settings, newSetting: 'foobar' }
}
</fabula>
```

The `commands` parameter is an Array with the result objects of every command
executed up to that point. Each result object contains `code`, `stdout`, 
`stderr` and `cmd` (the **Fabula** object representing the parsed command).
