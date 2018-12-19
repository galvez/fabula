import { compileTemplate, compileAST } from '../../src/index'

export function compileCommand(templateFile, settings) {
  const template = compileTemplate(templateFile, settings)
  return compileAST(template)
}
