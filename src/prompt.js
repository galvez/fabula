import prompts from 'prompts'

async function simplePrompt(message) {
  const result = await prompts({
    name: 'value',
    type: 'text',
    message
  })
  return result.value
}

export default function prompt(params) {
  if (typeof params === 'string') {
    return simplePrompt(params)
  } else if (typeof params === 'object') {
    return prompts(params)
  }
}
