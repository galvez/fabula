# This script runs on the remote instance
# to add Github SSH configuration for deployment

mkdir -p ~/.keys
chown -R ubuntu ~/.keys
chmod 755 ~/.keys

put <%= github.deploy_key %> ~/.keys/deploy_key
chmod 400 ~/.keys/deploy_key

echo ~/.ssh/config:
  Host <%= host %>
    Hostname <%= hostname %>
    IdentityFile ~/.keys/deploy_key
    User git
    StrictHostKeyChecking no
 