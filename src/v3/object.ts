import { Type } from './type'

export class Property {
  public key: string
  public type: Type
  public optional: boolean = false

  constructor(key: string, type: Type, options?: { optional?: boolean }) {
    this.key = key
    this.type = type
    this.optional = options?.optional ?? false
  }

  buildTsType(): string {
    return `${this.key}${this.optional ? '?' : ''}: ${this.type.buildTsType()}`
  }

  raw() {
    let optionsRaw = ''

    if (this.optional) {
      optionsRaw += `, {
optional: ${this.optional},`
    }

    if (optionsRaw) {
      optionsRaw += ' }'
    }

    return `property('${this.key}', ${this.type.raw()}${optionsRaw})`
  }
}

export function property(...arg: ConstructorParameters<typeof Property>) {
  return new Property(...arg)
}

export class Bulk implements Type {
  public properties: Property[]
  public alias?: string

  constructor(properties: Property[], options?: { alias?: string }) {
    this.properties = properties
    this.alias = options?.alias
  }

  buildTsType() {
    return `{
${this.properties.map((property) => property.buildTsType()).join('; ')} }`
  }

  raw() {
    let optionsRaw = ''

    if (this.alias) {
      optionsRaw += `, {
alias: '${this.alias}',`
    }

    if (optionsRaw) {
      optionsRaw += ' }'
    }

    return `bulk([${this.properties
      .map((property) => property.raw())
      .join(', ')}]${optionsRaw})`
  }
}

export function bulk(...arg: ConstructorParameters<typeof Bulk>) {
  return new Bulk(...arg)
}

export class Record implements Type {
  public properties: Property[]
  public alias?: string

  constructor(properties: Property[], options?: { alias?: string }) {
    this.properties = properties
    this.alias = options?.alias
  }

  buildTsType() {
    return `Record<string, {
${this.properties.map((property) => property.buildTsType()).join('; ')} }>`
  }

  raw() {
    let optionsRaw = ''

    if (this.alias) {
      optionsRaw += `, {
alias: '${this.alias}',`
    }

    if (optionsRaw) {
      optionsRaw += ' }'
    }

    return `record([${this.properties
      .map((property) => property.raw())
      .join(', ')}]${optionsRaw})`
  }
}

export function record(...arg: ConstructorParameters<typeof Record>) {
  return new Record(...arg)
}
