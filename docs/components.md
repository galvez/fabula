# Components

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

Any Bash statement will work inside `<commands>` (like the first one), but a few
particular statements are recognized by handlers using **Fabula**'s modular 
compiler API, which cause them to process and run differently. 

First off, anything line that starts with `local` is ran on the local machine.

In this snippet, we're using Fabula's special `append` command, which allows you 
to define an **indented block of text** (that gets **automatically dedendeted** 
when parsed) and append it to a file. 

Similarly, `local write` would overwrite the contents of the file, instead of 
simply appending to it. As simple as these blocks of inline text can be (way 
prettier than using native Bash at least), they can still be kind of funky for 
some people.

**Fabula** offers yet another alternative to this case, which is to add a 
`<string>` block with an identifier, that can later be referenced by an 
alternatively recognizable syntax for the special `append` command:

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