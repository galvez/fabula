
local append ~/.ssh/config:
  Host <%= host %>
    Hostname <%= hostname %>
    Port <%= port %>
    IdentityFile <%= privateKey %>
    StrictHostKeyChecking no
 