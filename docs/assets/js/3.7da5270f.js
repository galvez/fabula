(window.webpackJsonp=window.webpackJsonp||[]).push([[3],{169:function(t,s,e){"use strict";e.r(s);var a=e(0),n=Object(a.a)({},function(){var t=this,s=t.$createElement,e=t._self._c||s;return e("div",{staticClass:"content"},[t._m(0),t._v(" "),t._m(1),t._v(" "),e("p",[t._v("At its core, "),e("strong",[t._v("Fabula")]),t._v(" is a simple Bash script preprocessor and runner. It lets\nyou run scripts "),e("strong",[t._v("locally")]),t._v(" and on "),e("strong",[t._v("remote servers")]),t._v(". "),e("strong",[t._v("Fabula")]),t._v(" (latin for\n"),e("em",[t._v("story")]),t._v(") is inspired by Python's "),e("a",{attrs:{href:"https://www.fabfile.org/",target:"_blank",rel:"noopener noreferrer"}},[t._v("Fabric"),e("OutboundLink")],1),t._v(".")]),t._v(" "),t._m(2),t._m(3),t._v(" "),t._m(4),t._m(5),t._v(" "),t._m(6),t._v(" "),t._m(7),t._m(8),t._v(" "),t._m(9),t._v(" "),t._m(10),t._v(" "),t._m(11),t._v(" "),t._m(12),t._v(" "),t._m(13),t._m(14),t._v(" "),t._m(15),t._m(16),t._v(" "),t._m(17),t._v(" "),e("p",[t._v("Fabula's compiler will respect Bash's semantics for most cases, but allows\nyou to embed interpolated JavaScript code ("),e("code",[t._v("<% %>")]),t._v(" and "),e("code",[t._v("<%= %>")]),t._v(") using\n"),e("a",{attrs:{href:"https://lodash.com/docs/4.17.11#template",target:"_blank",rel:"noopener noreferrer"}},[e("code",[t._v("lodash.template")]),e("OutboundLink")],1),t._v(" internally. Take for instance a "),e("code",[t._v("fabula.js")]),t._v("\nconfiguration file listing a series of files and contents:")]),t._v(" "),t._m(18),t._m(19),t._v(" "),t._m(20),t._m(21),t._v(" "),t._m(22),t._v(" "),t._m(23),t._v(" "),t._m(24),e("p",[t._v("See more about Fabula components "),e("router-link",{attrs:{to:"/components.html"}},[t._v("in its dedicated section")]),t._v(".")],1),t._v(" "),t._m(25),t._v(" "),e("p",[t._v("Please refer to "),e("a",{attrs:{href:"https://hire.jonasgalvez.com.br/2019/may/05/a-vuejs-inspired-task-runner",target:"_blank",rel:"noopener noreferrer"}},[t._v("this introductory blog post"),e("OutboundLink")],1),t._v(".")])])},[function(){var t=this.$createElement,s=this._self._c||t;return s("p",[s("img",{attrs:{src:"https://user-images.githubusercontent.com/12291/50539530-e780e800-0b68-11e9-9453-e066015d0c2a.png",alt:"Fabula"}})])},function(){var t=this.$createElement,s=this._self._c||t;return s("h1",{attrs:{id:"introduction"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#introduction","aria-hidden":"true"}},[this._v("#")]),this._v(" Introduction")])},function(){var t=this.$createElement,s=this._self._c||t;return s("div",{staticClass:"language-sh extra-class"},[s("pre",{pre:!0,attrs:{class:"language-text"}},[s("code",[this._v('local echo "This runs on the local machine"\necho "This runs on the server"\n')])])])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[this._v("If you place the above snippet in a file named "),s("code",[this._v("echo.fab")]),this._v(" and configure a remote\nserver in Fabula's configuration file ("),s("code",[this._v("fabula.js")]),this._v("):")])},function(){var t=this,s=t.$createElement,e=t._self._c||s;return e("div",{staticClass:"language-js extra-class"},[e("pre",{pre:!0,attrs:{class:"language-js"}},[e("code",[e("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("export")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("default")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  ssh"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  \tserver"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n      hostname"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token string"}},[t._v("'1.2.3.4'")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n      username"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token string"}},[t._v("'user'")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n      privateKey"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token string"}},[t._v("'/path/to/key'")]),t._v("\n    "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n  "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])])},function(){var t=this,s=t.$createElement,e=t._self._c||s;return e("p",[t._v("Executing "),e("code",[t._v("fabula server echo")]),t._v(" will run the script on "),e("code",[t._v("server")]),t._v(" (as specified\nunder "),e("code",[t._v("ssh")]),t._v(" in "),e("code",[t._v("fabula.js")]),t._v("), but every command preceded by "),e("code",[t._v("local")]),t._v(" will run\non the local machine.")])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[this._v("Conversely, if you omit the "),s("code",[this._v("server")]),this._v(" argument like below:")])},function(){var t=this.$createElement,s=this._self._c||t;return s("div",{staticClass:"language-sh extra-class"},[s("pre",{pre:!0,attrs:{class:"language-text"}},[s("code",[this._v("fabula echo\n")])])])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[this._v("It'll run the script strictly in local "),s("em",[this._v("mode")]),this._v(", in which case it will "),s("strong",[this._v("fail")]),this._v(" if\nit finds any command that is not preceded by "),s("code",[this._v("local")]),this._v(". The point is to allow both\ncontext-hybrid scripts and strictly local ones.")])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[this._v("To run on all available servers, use "),s("code",[this._v("fabula all <task>")]),this._v(".")])},function(){var t=this.$createElement,s=this._self._c||t;return s("h2",{attrs:{id:"context"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#context","aria-hidden":"true"}},[this._v("#")]),this._v(" Context")])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[this._v("If you have a "),s("strong",[this._v("Fabula")]),this._v(" task that is bound to run on multiple servers and\nparts of the commands rely on information specific to each server, you can\nreference the current server settings via "),s("code",[this._v("$server")]),this._v(":")])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[this._v("In "),s("code",[this._v("fabula.js")]),this._v(":")])},function(){var t=this,s=t.$createElement,e=t._self._c||s;return e("div",{staticClass:"language-js extra-class"},[e("pre",{pre:!0,attrs:{class:"language-js"}},[e("code",[e("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("export")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("default")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  ssh"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    server1"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n      hostname"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token string"}},[t._v("'1.2.3.4'")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n      customSetting"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token string"}},[t._v("'foo'")]),t._v("\n    "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n    server2"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n      hostname"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token string"}},[t._v("'1.2.3.4'")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n      customSetting"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token string"}},[t._v("'bar'")]),t._v("\n    "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n  "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[this._v("In "),s("code",[this._v("task.fab")]),this._v(":")])},function(){var t=this.$createElement,s=this._self._c||t;return s("div",{staticClass:"language-sh extra-class"},[s("pre",{pre:!0,attrs:{class:"language-text"}},[s("code",[this._v("echo <%= quote($server.customSetting) %>\n")])])])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[this._v("Running "),s("code",[this._v("fab all task")]),this._v(" will cause the correct command to run for each server.\nNote that "),s("code",[this._v("quote()")]),this._v(" is a special function that quotes strings for Bash, and\nis provided automatically by "),s("strong",[this._v("Fabula")]),this._v(".")])},function(){var t=this.$createElement,s=this._self._c||t;return s("h2",{attrs:{id:"preprocessor"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#preprocessor","aria-hidden":"true"}},[this._v("#")]),this._v(" Preprocessor")])},function(){var t=this,s=t.$createElement,e=t._self._c||s;return e("div",{staticClass:"language-js extra-class"},[e("pre",{pre:!0,attrs:{class:"language-js"}},[e("code",[e("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("export")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("default")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  files"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  \tfile1"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token string"}},[t._v("'Contents of file1'")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n  \tfile2"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token string"}},[t._v("'Contents of file2'")]),t._v("\n  "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[this._v("You could write a "),s("strong",[this._v("Fabula")]),this._v(" script as follows:")])},function(){var t=this.$createElement,s=this._self._c||t;return s("div",{staticClass:"language-sh extra-class"},[s("pre",{pre:!0,attrs:{class:"language-text"}},[s("code",[this._v("<% for (const file in files) { %>\nlocal echo <%= quote(files[file]) %> > <%= file %>\n<% } %>\n")])])])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[s("strong",[this._v("Fabula")]),this._v(" will first process all interpolated JavaScript and then run the resulting script.")])},function(){var t=this.$createElement,s=this._self._c||t;return s("h2",{attrs:{id:"components"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#components","aria-hidden":"true"}},[this._v("#")]),this._v(" Components")])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[this._v("Concentrating options in a single file ("),s("code",[this._v("fabula.js")]),this._v(") makes sense sometimes, but\nmight also create a mess if you have a lot of specific options pertaining to\none specific task. "),s("strong",[this._v("Fabula")]),this._v(" lets you combine settings and commands in a\n"),s("strong",[this._v("single-file component")]),this._v(", inspired by Vue. Here's what it looks like:")])},function(){var t=this,s=t.$createElement,e=t._self._c||s;return e("div",{staticClass:"language-xml extra-class"},[e("pre",{pre:!0,attrs:{class:"language-xml"}},[e("code",[e("span",{pre:!0,attrs:{class:"token tag"}},[e("span",{pre:!0,attrs:{class:"token tag"}},[e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("fabula")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\nexport default {\n  files: {\n  \tfile1: 'Contents of file1',\n  \tfile2: 'Contents of file2'\n  }\n}\n"),e("span",{pre:!0,attrs:{class:"token tag"}},[e("span",{pre:!0,attrs:{class:"token tag"}},[e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("fabula")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n\n"),e("span",{pre:!0,attrs:{class:"token tag"}},[e("span",{pre:!0,attrs:{class:"token tag"}},[e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("commands")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n<% for (const file in files) { %>\nlocal echo <%= quote(files[file]) %> > <%= file %>\n<% } %>\n"),e("span",{pre:!0,attrs:{class:"token tag"}},[e("span",{pre:!0,attrs:{class:"token tag"}},[e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("commands")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n")])])])},function(){var t=this.$createElement,s=this._self._c||t;return s("h2",{attrs:{id:"motivation"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#motivation","aria-hidden":"true"}},[this._v("#")]),this._v(" Motivation")])}],!1,null,null,null);s.default=n.exports}}]);