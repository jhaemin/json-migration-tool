import { InferType } from './helpers'
import { Property } from './property'
import { Type } from './type'

export class ObjectLikeType<P extends Property> implements Type {
  public typeName: 'object' | 'record' = 'object'
  public properties: P[]
  public alias?: string

  constructor(properties: P[], options?: { alias?: string }) {
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
    properties: Property<string, Type>[],
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

export class ObjectType<
  P extends Property = Property
> extends ObjectLikeType<P> {
  public typeName = 'object' as const
}

export function object<P extends Property>(
  properties: P[],
  options?: { alias?: string }
) {
  return new ObjectType(properties, options)
}

export class RecordType<
  P extends Property = Property
> extends ObjectLikeType<P> {
  public typeName = 'record' as const
}

export function record<P extends Property>(
  properties: P[],
  options?: { alias?: string }
) {
  return new RecordType(properties, options)
}
