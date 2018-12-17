rm -rf /instance $HOME/.keys $HOME/.ssh/config
mkdir -p /instance/ $HOME/.keys
chown -R ubuntu /instance/ $HOME/.keys
chmod 755 $HOME/.keys
put <%= config.deploy_key %> $HOME/.keys/deploy_key
chmod 400 $HOME/.keys/deploy_key

echo $HOME/.ssh/config:
  Host <%= config.host %>
    Hostname <%= config.hostname %>
    Port <%= config.port %>
    IdentityFile $HOME/.keys/deploy_key
    User <%= config.user %>
    StrictHostKeyChecking no
