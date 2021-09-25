import { migrate } from '../../src'
import rule from './migration-rule'
import data from './data.json'

const test = () => {
  const migratedData = migrate(rule, data)

  console.log(migratedData)
}

test()
