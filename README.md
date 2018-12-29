<p align="center">
  <h1>⚙ Fabula 
  <a href="http://npmjs.com/package/fabula"><img src="https://badge.fury.io/js/fabula.svg?0.1.0"></a>
  <a href="https://github.com/nuxt/fabula/actions"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="88" height="20"><linearGradient id="b" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient><clipPath id="a"><rect width="88" height="20" rx="3" fill="#fff"/></clipPath><g clip-path="url(#a)"><path fill="#555" d="M0 0h37v20H0z"/><path fill="#4c1" d="M37 0h51v20H37z"/><path fill="url(#b)" d="M0 0h88v20H0z"/></g><g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="110"> <text x="195" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="270">build</text><text x="195" y="140" transform="scale(.1)" textLength="270">build</text><text x="615" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="410">passing</text><text x="615" y="140" transform="scale(.1)" textLength="410">passing</text></g></svg></a></h1>
  <span>Minimalist server configuration and task management.</span>
</p>

Go straight to the [full documentation][docs] if you'd like.

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

<img width="104" alt="screen shot 2018-12-24 at 8 35 05 pm" src="https://user-images.githubusercontent.com/12291/50407303-987b3180-07bb-11e9-80b8-9609f99023dc.png">

Proudly sponsored by [STORED][stored], which provides state-of-the-art e-commerce solutions in Brazil.

[jg]: http://hire.jonasgalvez.com.br
[stored]: http://stored.com.br
