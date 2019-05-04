'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

const fs = require('fs');
const path = require('path');
const consola = _interopDefault(require('consola'));
const __chunk_1 = require('./fabula-chunk.js');
const Module = _interopDefault(require('module'));
const template = _interopDefault(require('lodash.template'));
const merge = _interopDefault(require('lodash.merge'));
const __chunk_3 = require('./fabula-chunk3.js');

function parseArgv(line) {
  // Yes, I did write my own argv parser.
  // If you've got a better suggestion
  // (perhaps a Node.js built-in I missed)
  // Please let me know!
  const tokens = [];
  let token = '';
  let quote = false;
  let escape = false;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === ' ' && !quote && !escape) {
      tokens.push(token);
      token = '';
    } else if (line[i].match(/\\/)) {
      escape = true;
    } else if (line[i].match(/['"`]/) && !escape) {
      quote = !quote;
      token += line[i];
    } else {
      token += line[i];
    }
  }
  if (token.length) {
    tokens.push(token);
  }
  return tokens
}

class Command {
  constructor(cmd, line, env) {
    this.cmd = { ...cmd };
    this.params = {};
    this._env = env;
    this.init(line);
    this.firstLine = true;
  }
  init(line) {
    this.argv = parseArgv(line);
    this.local = this.argv[0] === 'local';
    if (this.local) {
      this.argv.shift();
    }
    this.source = [line];
  }
  registerHandler(line) {
    let match;
    // eslint-disable-next-line no-cond-assign
    if (match = line.match(/^(.+?)@([\w\d_]+)\s*$/)) {
      this.handler = match[2];
      this.init(match[1]);
      return match[1]
    } else {
      return line
    }
  }
  prepend(prepend, line) {
    if (this.cmd.prepend) {
      prepend = this.cmd.prepend(prepend);
    } else {
      // Custom commands run under the same permission
      // Fabula is running on -- so sudo is never prepended
      prepend = parseArgv(prepend)
        .filter(part => part !== 'sudo').join(' ');
    }
    line = `${prepend} ${line}`;
    this.init(line);
    return line
  }
  handleLine(line) {
    if (!this.cmd.line) {
      if (this.firstLine) {
        this.firstLine = false;
      }
      return false
    }
    const continueCommand = this.cmd.line.call(this, line);
    if (!this.firstLine && continueCommand) {
      this.source.push(line);
    }
    if (this.firstLine) {
      this.firstLine = false;
    }
    return continueCommand
  }
  logLines(out, writer) {
    if (typeof out !== 'string') {
      return
    }
    for (const line of out.split(/\n/g)) {
      if (line) {
        writer(line);
      }
    }
  }
  get env() {
    if (this.local) {
      return {
        ...this.settings.env.local,
        ...this._env
      }
    } else {
      return {
        ...this.settings.env.ssh,
        ...this._env
      }
    }
  }
  get context() {
    if (this._context) {
      return this._context
    }
    const ctx = { local: this.local };
    if (this.settings.$server) {
      ctx.server = this.settings.$server.$id;
    }
    this._context = ctx;
    return ctx
  }
  async run(conn, logger, retry = null) {
    let abort = false;
    const result = await this.cmd.command.call(this, conn, logger);
    if (this.handler && this.settings[this.handler]) {
      const fabula = {
        vars: this.settings.vars,
        abort: () => {
          abort = true;
        }
      };
      await this.settings[this.handler](result, fabula);
    }
    if (result) {
      // If failed and in a retry recursion, repeat until retry
      if (result.code && retry) {
        return this.run(conn, logger, retry - 1)
      // Or, if failed for the first time, and settings.retry is set to
      // a positive integer, start a new retry chain (recursion)
      } else if (result.code && typeof this.settings.retry === 'number' && this.settings.retry) {
        return this.run(conn, logger, this.settings.retry)
      }
      this.logLines(result.stdout, line => logger.info(this.context, line));
      this.logLines(result.stderr, line => logger.info(this.context, line));
      if (abort || (result.code && this.settings.fail)) {
        logger.info(this.context, abort ? '[ABORT]' : '[FAIL]', this.argv.join(' '));
        return true
      } else {
        logger.info(this.context, result.code ? '[FAIL]' : '[OK]', this.argv.join(' '));
      }
    }
    if (abort || (result && result.code && this.settings.fail)) {
      return true
    }
  }
}

const execCommand = {
  prepend(prepend) {
    // Don't filter sudo from prepend for exec
    return prepend
  },
  match(line) {
    if (this.local) {
      this.params.cmd = line.split(/^local\s+/)[1];
    } else {
      this.params.cmd = line;
    }
    return true
  },
  command(conn) {
    if (this.local) {
      return __chunk_3.execLocal([this.argv[0], this.argv.slice(1)], this.env, this.settings.$cwd)
    } else {
      return __chunk_1.exec(conn, this.params.cmd, this.env, this.settings.$cwd)
    }
  }
};

const commands = [
  () => Promise.resolve(require('./fabula-fabula.js')),
  () => Promise.resolve(require('./fabula-ensure.js')),
  () => Promise.resolve(require('./fabula-get.js')),
  () => Promise.resolve(require('./fabula-put.js')),
  () => Promise.resolve(require('./fabula-write.js')),
  () => Promise.resolve(require('./fabula-cd.js'))
];

// Ported from Eric S. Raymond's code at:
// https://github.com/python/cpython/blob/master/Lib/shlex.py
function quote(s) {
  if (!s) {
    return "''"
  }
  s = s.replace(/\n/g, '\\n');
  // Use single quotes, and put single quotes into double quotes
  // the string $'b is then quoted as '$'"'"'b'
  s = s.replace(/'/g, "'\"'\"'");
  return `'${s}'`
}

function requireFromString(code, name) {
  const m = new Module();
  // Second parameter is here is a virtual unique path
  m._compile(code, `components/${name}.js`);
  m.loaded = true;
  return m.exports
}

compile.loadComponent = function (source) {
  source = source.split(/\n/g)
    .filter(line => !line.startsWith('#'));

  const fabula = [];
  const script = [];
  const strings = [];

  let match;
  let element;
  let string = {};
  let prepend;

  for (const line of source) {
    // eslint-disable-next-line
    if (match = line.match(/^\s*<([^\/%][^>]+)>/)) {
      element = match[1].split(/\s+/g);
      prepend = element.slice(1).join(' ');
      element = element[0];
      // eslint-disable-next-line no-cond-assign
      if (match = match[1].match(/^string\s+id="([^"]+)"/)) {
        string = { id: match[1], lines: [] };
        element = 'string';
      }
      continue
    // eslint-disable-next-line no-cond-assign
    } else if (match = line.match(/^\s*<\/([^>]+)>/)) {
      if (match[1] === 'string') {
        strings.push(string);
      }
      element = null;
    }
    if (!element) {
      continue
    }
    switch (element) {
      case 'fabula':
        fabula.push(line);
        break
      case 'commands':
        script.push(line);
        break
      case 'string':
        string.lines.push(line);
        break
    }
  }
  return { fabula, script, strings, prepend }
};

compile.compileTemplate = function (cmd, settings) {
  const cmdTemplate = template(cmd, {
    imports: { quote },
    interpolate: /<%=([\s\S]+?)%>/g
  });
  return cmdTemplate(settings)
};

compile.splitMultiLines = function (source) {
  let multiline;
  return source.split(/\n/g).reduce((_lines, line) => {
    if (multiline) {
      line = line.trimLeft();
      multiline = /\\\s*$/.test(line);
      const index = _lines.length ? _lines.length - 1 : 0;
      _lines[index] += line.replace(/\s*\\\s*$/, ' ');
      return _lines
    }
    multiline = /\\\s*$/.test(line);
    return _lines.concat([line.replace(/\s*\\\s*$/, ' ')])
  }, [])
};

compile.parseLine = function (commands, command, line, prepend, settings, env, push) {
  let cmd;
  if (command) {
    if (command.handleLine(line)) {
      return command
    } else {
      command = null;
    }
  }
  let match;
  const commandSearchList = [...commands];
  if (settings.commands) {
    commandSearchList.push(...settings.commands);
    delete settings.commands;
  }
  commandSearchList.push(execCommand);
  let _line;
  for (cmd of commandSearchList) {
    if (cmd.match) {
      command = new Command(cmd, line, env);
      command.settings = settings;
      _line = command.registerHandler(line);
      if (prepend && !/^\s+/.test(_line)) {
        _line = command.prepend(prepend, _line);
      }
      match = command.cmd.match.call(command, _line);
      if (match) {
        break
      }
    }
  }
  if (match) {
    command.match = match;
  }
  if (command.handleLine(_line)) {
    push(command);
    return command
  } else {
    push(command);
  }
};

function compileComponent(name, source, settings) {
  const { fabula, script, strings, prepend } = compile.loadComponent(source);
  const componentSource = script.join('\n');

  const _componentSettings = requireFromString(fabula.join('\n'));
  const componentSettings = _componentSettings.default || _componentSettings;

  const globalEnv = { ...settings.env };
  delete globalEnv.local;
  delete globalEnv.ssh;

  const env = {
    ...globalEnv,
    ...componentSettings.env
  };
  delete componentSettings.env;

  // Can't override any of these from a component
  delete componentSettings.agent;
  delete componentSettings.ssh;

  merge(settings, componentSettings);

  settings.strings = strings.reduce((hash, string) => {
    const compiledString = compile.compileTemplate(string.lines.join('\n'), settings);
    return { ...hash, [string.id]: quote(compiledString, true) }
  }, {});

  return compile(name, componentSource, settings, prepend, env)
}

async function compile(name, source, settings, prepend, env = {}) {
  // If <fabula> or at least <commands> is detected,
  // process as a component and return
  if (source.match(/^\s*<(?:(?:fabula)|(commands))[^>]*>/g)) {
    return compileComponent(name, source, settings)
  }

  const _vars = {};
  settings.vars = new Proxy(_vars, {
    get(obj, prop) {
      if (prop in obj) {
        return obj[prop]
      } else {
        return settings.strings[prop]
      }
    }
  });

  // If no marked section is found, proceed to
  // regular commands compilation
  source = compile.compileTemplate(source, settings);

  // splitMultiLines() will merge lines ending in `\`
  // with the subsequent one, preserving Bash's behaviour
  const lines = compile.splitMultiLines(source)
    .filter(Boolean)
    .filter(line => !line.startsWith('#'));

  const _commands = await Promise.all(
    commands.map(cmd => cmd().then(c => c.default))
  );

  let currentCommand;
  const parsedCommands = [];

  for (const line of lines) {
    // If a component's line() handler returns true,
    // the same command object will be returned, allowing
    // parsing of custom mult-line special commands
    currentCommand = compile.parseLine(_commands, currentCommand, line, prepend, settings, env, (command) => {
      parsedCommands.push(command);
    });
  }

  return parsedCommands
}

// eslint-disable-next-line import/no-mutable-exports
exports.active = 0;

class Reporter {
  constructor(stream, reporter = null) {
    this.stream = stream;
    this.reporter = reporter || function (logObj) {
      return `${JSON.stringify(logObj)}\n`
    };
  }
  log(logObj) {
    exports.active += 1;
    this.stream.write(this.reporter(logObj), () => {
      exports.active -= 1;
    });
  }
}

class Logger {
  constructor(name, config) {
    this.loggers = {
      $server: new Proxy({}, {
        get: (_, prop) => {
          return this.loggers[`server:${prop}`]
        }
      })
    };
    for (const logContext of ['global', 'local', 'ssh']) {
      if (logContext in config.logs) {
        this.addLogger(logContext, config.logs[logContext]);
      }
    }
    if (config.ssh) {
      for (const server in config.ssh) {
        if (config.ssh[server].log) {
          this.addLogger(`server:${server}`, config.ssh[server].log);
        }
      }
    }
  }
  // Creates a logger under a name and path
  addLogger(logger, loggerInfo) {
    const path = loggerInfo.path || loggerInfo;
    const stream = fs.createWriteStream(path, { flags: 'a' });
    const reporters = [new Reporter(stream, loggerInfo.reporter)];
    this.loggers[logger] = consola.create(({ reporters }));
    return this.loggers[logger]
  }
  // Returns a logger by name
  getLogger(logger, path) {
    if (logger in this.loggers) {
      return this.loggers[logger]
    }
    return this.addLogger(logger, path)
  }
}

function createLogger(name, config) {
  const logger = new Logger(name, config);
  return new Proxy({}, {
    get(_, prop) {
      return (...args) => {
        // Determine context, if available
        let context;
        const msg = args;
        if (typeof msg[0] === 'object') {
          context = msg.shift();
        }
        if (context) {
          // Determine msg host
          if (context.local) {
            msg.unshift('[local]');
          } else if (context.server) {
            msg.unshift(`[${context.server}]`);
          }
          // Add component log entry if enabled
          if (context && context.log) {
            logger.getLogger(name, context.log)[prop](...msg);
          }
          // Add local log entry if enabled
          if (context.local && logger.loggers.local) {
            logger.loggers.local[prop](...msg);
          // Or add  server log entry if enabled
          } else {
            if (logger.loggers.$server[context.server]) {
              logger.loggers.$server[context.server][prop](...msg);
            }
            logger.loggers.ssh[prop](...msg);
          }
          // Add global log entry if enabled
          if (logger.loggers.global) {
            logger.loggers.global[prop](...msg);
          }
        }
        // Log to stdout if not silent
        if (!config.silent) {
          consola[prop](...msg);
        }
      }
    }
  })
}

async function runLocalSource(name, str, settings, logger) {
  settings = { ...settings, $name: name };
  const commands = await compile(name, str, settings);
  for (const command of commands) {
    if (!command.local) {
      logger.info('[FAIL]', command.source[0]);
      logger.fatal('No servers specified to run this remote command.');
      break
    }
    if (await command.run(null, logger)) {
      break
    }
  }
}

async function runSource(server, conn, name, str, settings, logger) {
  settings = {
    $server: {
      $id: server,
      ...conn.settings
    },
    $name: name,
    ...settings
  };
  const commands = await compile(name, str, settings);
  for (const command of commands) {
    if (await command.run(conn, logger)) {
      break
    }
  }
}

async function run(source, config, servers = [], logger = null) {
  const name = path.parse(source).name;
  source = fs.readFileSync(source).toString();

  // Setup main settings
  if (typeof config.fail === 'undefined') {
    config.fail = true;
  }
  const settings = { ...config };

  // Create logger if not provided
  if (logger == null) {
    logger = createLogger(name, config);
  }

  let remoteServers = servers;

  // If no servers provided, run in local mode
  if (servers.length === 0) {
    await runLocalSource(name, source, settings, logger);
    return
  }

  // Run in all servers
  if (servers.length === 1 && servers[0] === 'all') {
    remoteServers = Object.keys(config.ssh);
  }

  let conn;
  const runners = [];
  for (const server of remoteServers) {
    runners.push(() => new Promise(async (resolve) => {
      conn = await __chunk_1.getConnection(config.ssh[server]);
      await runSource(server, conn, name, source, settings, logger);
      resolve();
    }));
  }
  await Promise.all(runners.map(runner => runner()));
}

exports.compile = compile;
exports.parseArgv = parseArgv;
exports.run = run;
exports.runLocalSource = runLocalSource;
exports.runSource = runSource;