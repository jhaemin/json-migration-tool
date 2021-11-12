const { parseTsTypes } = require('../dist/parse-ts-types')
const fs = require('fs')
const path = require('path')

console.log(path.resolve(__dirname, 'types/mock.ts'))

const mock = fs.readFileSync(path.resolve(__dirname, 'types/mock.ts'), 'utf-8')

console.log(parseTsTypes(mock))
