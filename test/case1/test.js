import { migrate } from '../../src'
import rules from './migration-rules'
import data from './data.json'

const test = () => {
  const migratedData = migrate(rules, data)

  console.log(JSON.stringify(migratedData, null, 2))
}

test()
