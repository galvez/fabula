
const expat = require('node-expat')

function loadComponent(source) {
  source = source.split(/\n/g)
    .filter(line => !line.startsWith('#'))

  const fabula = []
  const script = []
  const strings = []

  let match
  let element
  let string = {}

  for (const line of source) {
    if (match = line.match(/^\s*<(?!\/)([^>]+)>/)) {
      element = match[1]
      if (match = element.match(/^string\s+id="([^"]+)"/)) {
        string = {id: match[1], lines: []}
        element = 'string'
      }
      continue
    } else if (match = line.match(/^\s*<\/([^>]+)>/)) {
      if (match[1] === 'string') {
        strings.push(string)
      }
      element = null      
      continue
    }
    console.log('>', element, '<')
    switch (element) {
      case 'fabula':
        fabula.push(line)
        break
      case 'script':
        script.push(line)
        break
      case 'string':
        console.log('!')
        string.lines.push(line)
        break
    }
  }
  console.log('fabula', fabula)
  console.log('script', script)
  console.log('strings', strings)
}

loadComponent(`<fabula>
foobar1
foobar2
</fabula>

<script>
foobar3
foobar4
</script>

<string id="foo">
foobar5
</string>

<string id="bar">
foobar6
</string>
`)
