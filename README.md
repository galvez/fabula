<p align="center">
  <h1>Fabula 
  <a href="http://npmjs.com/package/fabula"><img src="https://badge.fury.io/js/fabula.svg?0.2.0"></a>
  <a href="https://github.com/galvez/fabula/actions"><img src="https://img.shields.io/badge/build-passing-47c11f.svg"></a></h1>
  <span>Minimalist server configuration and task management.</span>
</p>

Go straight to the [full documentation][docs] if you'd like.

Or read the [introductory blog post][post].

[post]: https://hire.jonasgalvez.com.br/2019/may/05/a-vuejs-inspired-task-runner/

# Introduction

At its core, **Fabula** is a simple Bash script preprocessor and runner. It lets
you run scripts **locally** and on **remote servers**. **Fabula** (latin for 
_story_) is inspired by Python's [Fabric][f].

[f]: https://www.fabfile.org/

```xml
<fabula>
export default {
  docsDir: {
    local: './docs',
    remote: '/remote/path/www' 
  }
}
</fabula>

<commands>
local vuepress build <%= docsDir.local %>
put <%= docsDir.local %>/.vuepress/dist/ <%= docsDir.remote %>
sudo service nginx restart
</commands>
```

Inspired by Vue, it lets you keep settings and commands in concise **single-file components**.

Please refer to the [full documentation][docs] to learn more.

[docs]: https://galvez.github.io/fabula/

## Meta

Created by [Jonas Galvez][jg].

[jg]: http://hire.jonasgalvez.com.br
