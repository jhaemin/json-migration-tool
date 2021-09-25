import { JsonMigrationRule, JsonMigrationRules } from './types'

export const migrate = (
  migrationRule: JsonMigrationRule | JsonMigrationRules,
  json: Record<string, any>
) => {
  const rules = Array.isArray(migrationRule) ? migrationRule : [migrationRule]
  const data = JSON.parse(JSON.stringify(json))

  for (const rule of rules) {
    const { type } = rule

    if (type === 'add') {
      const { path, defaultValue } = rule
      const keys = path.split('.')

      let target = data

      for (let i = 0; i < keys.length; i += 1) {
        const key = keys[i]

        if (i === keys.length - 1) {
          target[key] = defaultValue
        } else {
          target = target[key]
        }
      }
    }
  }

  return data
}
