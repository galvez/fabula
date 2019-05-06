'use strict';

const fs = require('fs');
const child_process = require('child_process');

function execLocal(cmd, env = {}, cwd = null) {
  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    const options = {
      env: { ...process.env, ...env },
      cwd: cwd || process.cwd()
    };

    const stream = child_process.spawn(...cmd, options);
    stream.on('error', err => resolve(err));
    stream.stdout.on('data', (data) => { stdout += data; });
    stream.stderr.on('data', (data) => { stderr += data; });
    stream.on('exit', (code) => {
      resolve({ stdout, stderr, code });
    });
  })
}

function localWrite(filePath, fileContents) {
  try {
    fs.writeFileSync(filePath, fileContents);
    return { code: 0 }
  } catch (err) {
    return { code: 1, stderr: err.message || err.toString() }
  }
}

function localAppend(filePath, fileContents) {
  try {
    fs.appendFileSync(filePath, fileContents);
    return { code: 0 }
  } catch (err) {
    return { code: 1, stderr: err.message || err.toString() }
  }
}

exports.execLocal = execLocal;
exports.localAppend = localAppend;
exports.localWrite = localWrite;
