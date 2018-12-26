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

Conversely, if you omit the `server` argument like below:

```sh
fabula echo
```

It'll run the script strictly in local _mode_, in which case it will **fail** if
it finds any command that is not preceded by `local`. The point is to allow both
context-hybrid scripts and strictly local ones.

To run on all available servers, use `fabula all <task>`.

## Preprocessor

Fabula's compiler will respect Bash's semantics for most cases, but allows
you to embed interpolated JavaScript code (`<% %>` and `<%= %>`) using 
[`lodash.template`][lodash] internally. Take for instance a `fabula.js` 
configuration file listing a series of files and contents:


```js
export default {
  files: {
  	file1: 'Contents of file1',
  	file2: 'Contents of file2'
  }
}
```

You could write a **Fabula** script as follows:

```sh
<% for (const file in files) { %>
local echo <%= quote(files[file]) %> > <%= file %>
<% } %>
```

## Components

Concentrating options in a single file (`fabula.js`) makes sense sometimes, but
might also create a mess if you have a lot of specific options pertaining to 
one specific task. **Fabula** lets you combine settings and commands in a 
**single-file component**, inspired by Vue. Here's what it looks like:

```xml
<fabula>
export default {
  files: {
  	file1: 'Contents of file1',
  	file2: 'Contents of file2'
  }
}
</fabula>

<commands>
<% for (const file in files) { %>
local echo <%= quote(files[file]) %> > <%= file %>
<% } %>
</commands>
```

See more about Fabula components [in its dedicated section](/components)

## Motivation

For the longest time, I have packaged my Node applications together with a 
[Fabric]() installation for running SSH tasks. For 
those who don't know, Fabric allows you to write Python scripts for running 
commands [both locally and remote][f-ops], by specifying external servers 
and keys for SSH access. Below is a sample `Fabric` task:


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


Granted, these other packages are rather full-blown abstractions for server 
management and deployment, in contrast to Fabric which is architected more 
closely to the metal (SSH), _so to speak_. Fabric avoids abstracting too much, 
it just lets you compose low-level commands with easier configuration and a 
convenience transport layer independent from `ssh-agent`.

Given there's [a mature SSH2 package for Node][ssh2], I set out to write a 
Fabric **and** Nuxt inspired new tool.

[f]: https://www.fabfile.org/
[lodash]: https://lodash.com/docs/4.17.11#template
[f-ops]: http://docs.fabfile.org/en/1.14/api/core/operations.html
[pip]: https://pypi.org/project/pip/
[ssh2]: https://github.com/mscdex/ssh2


