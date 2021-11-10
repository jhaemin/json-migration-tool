import { parseTsTypes } from './parse-ts-types'
import fs from 'fs'
import path from 'path'
import { buildJrsSourceCode, buildTsType } from '.'

const mock = fs.readFileSync(
  path.resolve(__dirname, '../__TEST__/types/mock.ts'),
  'utf-8'
)

const mockJrs = parseTsTypes(mock)

console.log(buildTsType(mockJrs))

const mockSourceCode = buildJrsSourceCode(mockJrs)

console.log(mockSourceCode)
