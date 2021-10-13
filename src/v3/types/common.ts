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

export type JsonRuntimeSchema = ObjectLikeType
