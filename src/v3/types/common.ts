import { ObjectLikeType } from './object'

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
  alias?: string
  buildTsType(): string
  raw(): string
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
    }
  }

  return `'unsupported type'`
}
