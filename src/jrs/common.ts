import { ObjectType } from './object'

export interface Type {
  typeName:
    | 'string'
    | 'number'
    | 'object'
    | 'record'
    | 'array'
    | 'tuple'
    | 'boolean'
    | 'null'
    | 'union'
    | 'intersection'
  alias?: string
  _buildTsType(aliases: Map<string, string>): string
  _raw(aliases: Map<string, string>): string
  isCorrectType(value: unknown): boolean
}

export type JsonRuntimeSchema = ObjectType

export function valueToString(value: any) {
  const type = typeof value

  if (type === 'undefined') {
    return ''
  }

  if (type === 'boolean' || type === 'number' || value === null) {
    return `${value}`
  }

  if (type === 'string') {
    return `'${value}'`
  }

  if (type === 'object') {
    const properties: string = Object.entries(value)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => {
        return `${k}: ${valueToString(v)}`
      })
      .join(', ')

    if (properties) {
      return `{ ${properties} }`
    } else {
      return `{}`
    }
  }

  console.log('value:')
  console.log(value)
  console.log('type:')
  console.log(type)

  throw Error(`Unsupported type of value to convert to string.`)
}
