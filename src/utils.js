
quote.unsafeRE = new RegExp('[^\\w@%+=:,./-]')

// Ported from Eric S. Raymond's code at:
// https://github.com/python/cpython/blob/master/Lib/shlex.py
export function quote(s) {
  if (!s) {
    return "''"
  }
  if (quote.unsafeRE.test(s)) {
    return s
  }
  // Use single quotes, and put single quotes into double quotes
  // the string $'b is then quoted as '$'"'"'b'
  return `'${s.replace(/'/g, "'\"'\"'")}'`
}
