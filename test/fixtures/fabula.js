import { launchTestSSHServer } from '../server'

export default async function() {
  const [
    server1,
    server2
  ] = await Promise.all([
    launchTestSSHServer(),
    launchTestSSHServer()
  ])
  return {
    ssh: {
      server1: server1.settings,
      server2: server2.settings
    },
    done() {
      server1.server.close()
      server2.server.close()
    },
    logs: {
      global: 'logs/global-log.log',
      local: 'logs/local-log.log',
      ssh: 'logs/ssh-log.log'
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
