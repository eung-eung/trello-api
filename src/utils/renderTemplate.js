import fs from 'fs'
import Handlebars from 'handlebars'
import path from 'path'

export const renderTemplate = (fileName, data) => {
  const filePath = path.join(process.cwd(), '/src/templates', fileName)

  const source = fs.readFileSync(filePath, 'utf-8')
  const template = Handlebars.compile(source)
  return template(data)
}