import { JsonMigrationRule } from 'src/types'

const rule: JsonMigrationRule = {
  type: 'add',
  path: 'mankind.contributions',
  defaultValue: 'archaeology, anthropology, genetics',
}

export default rule
