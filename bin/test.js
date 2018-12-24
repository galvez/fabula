
const { runString } = require('../src/compile')

const settings = {
  host: 'stored',
  username: 'ubuntu',
  hostname: '3.80.152.37',
  privateKey: '~/Keys/galvez'
}

runString({
  branch: 'my-branch',
  someFlag: true,
  host: 'host',
  hostname: 'hostname',
  privateKey: '/keys/private-key',
  k8s: {
    clusterName: 'k8s-name'
  }
}, `
cd ~

gcloud container clusters create <%= k8s.clusterName %> \\
  --machine-type=n1-standard-2 \\
  --zone=southamerica-east1-a \\
  --num-nodes=4

cd foobar

mkdir foobar

append ~/.ssh/config2:
  Host <%= host %>
    Hostname <%= hostname %>
    IdentityFile <%= privateKey %>

`)

// append ~/.ssh/config2:
//   Host <%= host %>
//     Hostname <%= hostname %>
//     IdentityFile <%= privateKey %>

// git checkout <%= branch %>

// echo "foobarfobar" > foobar

// <% if (someFlag) { %>
// local touch /tmp/some-file
// <% } %>


// runString(settings, `
// echo ~/.ssh/config:
//   foobar
// cd ~
// put foo bar
// `)

// runString(settings, `
// local append ~/.ssh/config2:
//   Host <%= host %>
//     Hostname <%= hostname %>
//     IdentityFile <%= privateKey %>
// `)
