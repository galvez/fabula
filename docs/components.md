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

