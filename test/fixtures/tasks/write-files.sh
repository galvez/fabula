
local mkdir /tmp/files
<% for (const file of files) { %>
local echo /tmp/files/<%= file %>:
  this is the content of <%= file %>
<% } %>

mkdir /tmp/files
<% for (const file of files) { %>
echo /tmp/files/<%= file %>:
  this is the content of <%= file %>
<% } %>
