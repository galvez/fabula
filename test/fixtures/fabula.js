const { launchTestSSHServer } = require('../server')

function reporter (info) {
  return `${info.args.join(' ')}\n`
}

module.exports = async function() {
  const [
    server1,
    server2
  ] = await Promise.all([
    launchTestSSHServer(),
    launchTestSSHServer()
  ])
  return {
    ssh: {
      server1: {
        log: { path: 'logs/server1-log.log', reporter },
        ...server1.settings
      },
      server2: {
        log: { path: 'logs/server2-log.log', reporter },
        ...server2.settings
      }
    },
    done() {
      server1.server.close()
      server2.server.close()
    },
    logs: {
      global: { path: 'logs/global-log.log', reporter },
      local: { path: 'logs/local-log.log', reporter },
      ssh: { path: 'logs/ssh-log.log', reporter }
    },
    env: {
      GLOBAL_VAR: 'GLOBAL_VAR',
      local: {
        GLOBAL_LOCAL_VAR: 'GLOBAL_LOCAL_VAR'
      },
      ssh: {
        GLOBAL_SSH_VAR: 'GLOBAL_SSH_VAR'
      }
    }
  }
}
