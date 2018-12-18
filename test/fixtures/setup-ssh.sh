rm -rf /instance $HOME/.keys $HOME/.ssh/config
mkdir -p /instance/ $HOME/.keys
chown -R ubuntu /instance/ $HOME/.keys
chmod 755 $HOME/.keys
put <%= privateKey %> $HOME/.keys/deploy_key
chmod 400 $HOME/.keys/deploy_key

echo $HOME/.ssh/config:
  Host <%= host %>
    Hostname <%= hostname %>
    Port <%= port %>
    IdentityFile $HOME/.keys/deploy_key
    User <%= username %>
    StrictHostKeyChecking no
