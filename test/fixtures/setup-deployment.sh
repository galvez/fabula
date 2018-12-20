# This script runs on the remote instance
# to add Github SSH configuration for deployment

# ~ is automatically expanded to $HOME
mkdir -p ~/.keys
chown -R ubuntu ~/.keys
chmod 755 ~/.keys

# put is a special command that performs a SFTP
# PUT operation from <source> to <target>, where
# <source> is a path on the local machine
put <%= github.deploy_key %> ~/.keys/deploy_key
chmod 400 ~/.keys/deploy_key

# echo is a special command that overrides the original 
# UNIX command with an indentation-based block to define 
# multi-line contents for a file, where the target path 
# is set on the first line, followed by a single colon to 
# indicate the start of the text block. The text is automatically 
# dedented to the number of white spaces on the first line
echo ~/.ssh/config:
  Host <%= host %>
    Hostname <%= hostname %>
    IdentityFile ~/.keys/deploy_key
    User git
    StrictHostKeyChecking no
 