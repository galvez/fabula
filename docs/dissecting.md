
## Dissecting a sample Fabula script

```sh
# This script runs on the remote instance
# to add Github SSH configuration for deployment

mkdir -p /app/.keys
chown -R ubuntu /app/.keys
chmod 755 /app/.keys

# put is a special command that performs a SFTP
# PUT operation from <source> to <target>, where
# <source> is a path on the local machine
put <%= github.deploy_key %> /app/.keys/deploy_key
chmod 400 /app/.keys/deploy_key

# echo is a special command that overrides the original 
# UNIX command with an indentation-based block to define 
# multi-line contents for a file, where the target path 
# is set on the first line, followed by a single colon to 
# indicate the start of the text block. The text is automatically 
# dedented to the number of white spaces on the first line
echo ~/.ssh/config:
  Host <%= host %>
    Hostname <%= hostname %>
    IdentityFile /app/.keys/deploy_key
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
