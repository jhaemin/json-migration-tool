export interface Type {
  typeName:
    | 'string'
    | 'number'
    | 'object'
    | 'record'
    | 'array'
    | 'set'
    | 'boolean'
    | 'null'
    | 'union'
  alias?: string
  buildTsType(): string
  raw(): string
}
