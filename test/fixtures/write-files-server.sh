# This script runs on the server to create a 
# series of files using the `files` Array provided 
# in the each server setting

mkdir /tmp/files
<% for (const file of files) { %>
echo /tmp/files/<%= file %>:
  this is the content of <%= file %>
<% } %>
