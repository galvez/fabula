![Fabula](https://user-images.githubusercontent.com/12291/57234418-e9672600-6ff6-11e9-96bf-e8f2133efaa3.png)

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

## Context

If you have a **Fabula** task that is bound to run on multiple servers and
parts of the commands rely on information specific to each server, you can
reference the current server settings via `$server`:

In `fabula.js`:

```js
export default {
  ssh: {
    server1: {
      hostname: '1.2.3.4',
      customSetting: 'foo'
    },
    server2: {
      hostname: '1.2.3.4',
      customSetting: 'bar'
    }
  }
}
```

In `task.fab`:

```sh
echo <%= quote($server.customSetting) %>
```

Running `fab all task` will cause the correct command to run for each server.
Note that `quote()` is a special function that quotes strings for Bash, and 
is provided automatically by **Fabula**.

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

**Fabula** will first process all interpolated JavaScript and then run the resulting script.

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

See more about Fabula components [in its dedicated section](/components.html).

## Motivation

Please refer to [this introductory blog post][post].

[f]: https://www.fabfile.org/
[lodash]: https://lodash.com/docs/4.17.11#template
[post]: https://hire.jonasgalvez.com.br/2019/may/05/a-vuejs-inspired-task-runner
