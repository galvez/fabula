# This script runs on the local machine to create a 
# series of files using the `files` Array provided 
# in the each server setting

local mkdir /tmp/files
<% for (const file of files) { %>
local echo /tmp/files/<%= file %>:
  this is the content of <%= file %>
<% } %>
