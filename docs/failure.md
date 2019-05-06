# Failure

By default, a single failing command will cause **Fabula** to exit and prevent
any subsequent commands or tasks from running. You can disable this behaviour in **Fabula**'s configuration file:

```js
export default {
  fail: false
}
```

You can also set `fail: false` on a **Fabula** component.

## Handlers

You can handle results for individual commands as well. A common example is
handling a `yarn install` result. If `fail` is set to `false`, you may want
to handle the result of certain commands.

```xml
<fabula>
export default {
  fail: false
}
</fabula>

<commands>
unimportant command 1
unimportant command 2
yarn install
yarn build
</commands>
```

In the above script, you would want to ensure `yarn install` finished 
succesfully before moving on to `yarn build`, even though you don't care about 
the first two unimportant commands. 

**Fabula** lets you tag an individual command line and set a _callback_ matching 
the tag given:

```xml
<fabula>
export default {
  fail: false,
  check({ code, stderr }, fabula) {
    if (code) {
      fabula.abort()
    }
  }
}
</fabula>

<commands>
unimportant command 1
unimportant command 2
yarn install @check
yarn build
</commands>
```

You can tag a command by placing a label prefixed with **`@`** at the end of it.
You can then set a handler method named with the same label. The first parameter 
passed to the handler method is the result object, which contains `code` (exit 
code), `stdout`, `stdin` and also `cmd` -- a reference to the Fabula object 
representing the parsed command. The second parameter is the **Fabula** context, 
which provides access to `settings` and `abort()`.


You can also provide a block of commands to run after the handler. This allows
you to add or change properties in **Fabula**'s settings object prior to the
JavaScript preprocessing. 

Take [this example][handler-example] from the test suite fixtures.

[handler-example]: https://github.com/nuxt/fabula/blob/master/test/fixtures/handler.fab

```xml
<fabula>
export default {
  fail: false,
  handle: (result) => {
    return {
      touchErrorCode: result.code
    }
  }
}
</fabula>

<commands local>
touch /parent/doesnt/exist @handle:
  local write /tmp/fabula-handler-test:
    <%= touchErrorCode %>
cat /tmp/fabula-handler-test
rm /tmp/fabula-handler-test
</commands>
```

The block after `@handle` is only compiled after the current command has been
executed and you've had a chance to **handle** it. The handling function (which
must match the `@name` you use to tag the command) can return an object which
is then merged back into **Fabula** settings object. The snippet above will
result in `1` being written to the test file (which is then removed so no 
testing files are left behind).

## Ensure

For the sole purpose of ensuring that a specific command runs successfully in 
a **Fabula** task otherwise permissive to failure, you can also use the special
`ensure` command:

```xml
<commands>
unimportant command 1
unimportant command 2
ensure yarn install
yarn build
</commands>
```

Or, alternatively, grouped in a block:

```xml
<commands>
unimportant command 1
unimportant command 2
ensure:
  yarn install
  yarn build
</commands>
```

Note that if you use `<commands>` with a [prepend command][pc] all commands
within `ensure` will be altered, but not `ensure` itself.

[pc]: components.html#prepend

## Retries

Fabula has a built-in retry mechanism. Use the `-r` flag to specify the numbers 
of attempts that must be made for every command before accepting failure.

```sh
$ fabula all tasks/common-task -r 3
```