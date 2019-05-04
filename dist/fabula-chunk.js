'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

const fs = require('fs');
const consola = _interopDefault(require('consola'));
const util = require('util');
const read = _interopDefault(require('read'));
const ssh2 = require('ssh2');

function exit(err) {
  consola.fatal(err.message || err);
  process.exit();
}

function askPassphrase(privateKey) {
  return new Promise((resolve) => {
    const prompt = {
      prompt: `${privateKey} requires a passphrase: `,
      silent: true,
      replace: '*'
    };
    read(prompt, (_, passphrase) => {
      resolve(passphrase);
    });
  })
}

function isKeyEncrypted(privateKey) {
  if (/^-*BEGIN ENCRYPTED PRIVATE KEY/g.test(privateKey)) {
    return true
  } else {
    const firstLines = privateKey.split(/\n/g).slice(0, 2);
    return firstLines.some(line => line.match(/Proc-Type: 4,ENCRYPTED/))
  }
}

function getConnection(settings) {
  return new Promise(async (resolve, reject) => {
    const conn = new ssh2.Client();
    conn.exec = util.promisify(conn.exec).bind(conn);
    conn.sftp = util.promisify(conn.sftp).bind(conn);
    conn.on('error', exit);
    conn.on('ready', () => {
      conn.settings = settings;
      resolve(conn);
    });

    let connect;
    if (settings.privateKey) {
      const privateKey = fs.readFileSync(settings.privateKey).toString();
      if (!settings.passphrase && isKeyEncrypted(privateKey)) {
        settings.passphrase = await askPassphrase(settings.privateKey);
      }
      connect = () => conn.connect({ ...settings, privateKey });
    } else {
      if (!settings.agent) {
        settings.agent = process.env.SSH_AUTH_SOCK;
      }
      connect = () => conn.connect({ ...settings });
    }
    await connect();
  })
}

async function write(conn, filePath, fileContents) {
  const stream = await conn.sftp();
  return stream.writeFile(filePath, fileContents)
}

async function append(conn, filePath, fileContents) {
  const stream = await conn.sftp();
  return stream.appendFile(filePath, fileContents)
}

async function get(conn, remotePath, localPath) {
  const stream = await conn.sftp();
  return stream.fastGet(remotePath, localPath)
}

async function put(conn, localPath, remotePath) {
  const stream = await conn.sftp();
  return stream.fastPut(localPath, remotePath)
}

function exec(conn, cmd, env = {}) {
  return new Promise(async (resolve, reject) => {
    let stdout = '';
    let stderr = '';
    const stream = await conn.exec(cmd, { env });
    stream.on('close', (code, signal) => {
      resolve({ stdout, stderr, code, signal });
    });
    stream.on('data', (data) => { stdout += data; });
    stream.stderr.on('data', (data) => { stderr += data; });
  })
}

exports.append = append;
exports.exec = exec;
exports.get = get;
exports.getConnection = getConnection;
exports.put = put;
exports.write = write;
