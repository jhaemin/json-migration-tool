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

export class ObjectLikeType implements Type {
  public typeName: 'object' | 'record' = 'object'
  public properties: Property[] = []
  public alias?: string

  constructor(properties: Property[], options?: { alias?: string }) {
    this.properties = properties
    this.alias = options?.alias
  }

  buildTsType() {
    let objStr = `{
${this.properties.map((property) => property.buildTsType()).join('; ')} }`

    if ((this.typeName = 'record')) {
      objStr = `Record<string, ${objStr}>`
    }

    return objStr
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

    return `${this.typeName}([${this.properties
      .map((property) => property.raw())
      .join(', ')}]${optionsRaw})`
  }

  private compare(
    properties: Property[],
    object: Record<string, unknown>
  ): boolean {
    const objectKeys = Object.keys(object)

    if (properties.length !== objectKeys.length) return false

    for (const property of properties) {
      console.log(property.key)

      const objectValue = object[property.key]

      if (
        property.optional === false &&
        objectKeys.indexOf(property.key) === -1
      ) {
        return false
      }

      if (property.type.isCorrectType(objectValue) === false) {
        return false
      }

      if (
        property.type instanceof ObjectLikeType &&
        typeof objectValue === 'object'
      ) {
        if (
          this.compare(
            property.type.properties,
            objectValue as Record<string, unknown>
          ) === false
        )
          return false
      }
    }

    return true
  }

  isCorrectType(value: unknown) {
    if (typeof value !== 'object' || value === null) {
      return false
    }

    return this.compare(this.properties, value as Record<string, unknown>)
  }
}

export class ObjectType extends ObjectLikeType {
  public typeName = 'object' as const
}

export function object(...arg: ConstructorParameters<typeof ObjectType>) {
  return new ObjectType(...arg)
}

export class RecordType extends ObjectLikeType {
  public typeName = 'record' as const
}

export function record(...arg: ConstructorParameters<typeof RecordType>) {
  return new RecordType(...arg)
}
