export default {
  logs: {
    global: 'global-log.log',
    local: 'local-log.log'
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
