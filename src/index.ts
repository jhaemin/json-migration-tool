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

      inspect(data, path, (target, key) => {
        target[key] = defaultValue
      })
    } else if (type === 'remove') {
      const { path } = rule

      inspect(data, path, (target, key) => {
        delete target[key]
      })
    } else if (type === 'move') {
      const { fromPath, toPath } = rule

      inspect(data, fromPath, (fromTarget, fromKey) => {
        inspect(data, toPath, (toTarget, toKey) => {
          toTarget[toKey] = fromTarget[fromKey]

          delete fromTarget[fromKey]
        })
      })
    }
  }

  return data
}

const inspect = (
  obj: Record<string, any>,
  path: string,
  callback: (target: Record<string, any>, key: string) => void
) => {
  const keys = path.split('.')

  let target = obj

  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i]

    if (i === keys.length - 1) {
      callback(target, key)
    } else {
      target = target[key]
    }
  }
}
