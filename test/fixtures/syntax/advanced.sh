
local cd ~
local mkdir -p test

echo /tmp/test:
	goes into the file

sudo service nginx restart

<% for (const server of servers ) { %>
local append ~/.ssh/config.test:
  Host <%= server.host %>
    Hostname <%= server.hostname %>
    Port <%= server.port %>
    IdentityFile <%= server.privateKey %>
    StrictHostKeyChecking no
<% } %>

gcloud container clusters create <%= k8s.clusterName %> \
  --machine-type=n1-standard-2 \
  --zone=southamerica-east1-a \
  --num-nodes=4

ls test
