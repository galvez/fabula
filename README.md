<p><img 
src="https://user-images.githubusercontent.com/904724/57233916-e2084280-701f-11e9-894b-585d563dc7d8.png"/></p>

<p align="center">
  <h1>Fabula 
  <a href="http://npmjs.com/package/fabula"><img src="https://badge.fury.io/js/fabula.svg?0.2.0"></a>
  <a href="https://github.com/nuxt/fabula/actions"><img src="https://img.shields.io/badge/build-passing-47c11f.svg"></a></h1>
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

[docs]: https://nuxt.github.io/fabula/

## Meta

Created and maintained by [Jonas Galvez][jg] with the help of the **Nuxt Core Team**.

<img width="80" alt="screen shot 2018-12-24 at 8 35 05 pm" src="https://user-images.githubusercontent.com/12291/50407303-987b3180-07bb-11e9-80b8-9609f99023dc.png">

Proudly sponsored by [STORED][stored], which provides state-of-the-art e-commerce solutions in Brazil.

[jg]: http://hire.jonasgalvez.com.br
[stored]: http://stored.com.br
