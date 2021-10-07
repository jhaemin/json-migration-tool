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
  isCorrectType(value: unknown): boolean
}

export class Primitive implements Type {
  public typeName: 'string' | 'number' | 'boolean' | 'null'

  constructor(public defaultValue?: string | number | boolean | null) {
    this.typeName = 'null'
  }

  buildTsType() {
    return this.typeName
  }

  raw() {
    let defaultValue = this.defaultValue === undefined ? '' : this.defaultValue

    if (this.typeName === 'string') {
      defaultValue = `'${defaultValue}'`
    }

    return `${this.typeName}(${defaultValue})`
  }

  isCorrectType(value: unknown) {
    if (this.typeName === 'null') {
      return value === null
    }

    console.log(`value: ${value}, typeof value: ${typeof value}`)

    return typeof value === this.typeName
  }
}
