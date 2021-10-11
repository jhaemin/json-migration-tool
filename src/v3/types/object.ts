import { Property } from './property'
import { Type } from './common'
import { InferType } from './helpers'

export class ObjectLikeType<P extends Property[] = Property[]> implements Type {
  public typeName: 'object' | 'record' = 'object'
  public properties: P
  public alias?: string

  constructor(properties: P, options?: { alias?: string }) {
    this.properties = properties
    this.alias = options?.alias
  }

  buildTsType() {
    let objStr = `{
${this.properties.map((property) => property.buildTsType()).join('; ')} }`

    if (this.typeName === 'record') {
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

  private compare(object: Record<string, unknown>): boolean {
    const objectKeys = Object.keys(object)

    for (const property of this.properties) {
      const objectValue = object[property.key]
      const keyExists = objectKeys.indexOf(property.key) !== -1

      // When the property is not optional
      // but the key doesn't exist.
      if (property.optional === false && keyExists === false) {
        return false
      }

      // When the property is optional
      // and the key doesn't exist.
      if (property.optional === true && keyExists === false) {
        continue
      }

      if (property.type.isCorrectType(objectValue) === false) {
        return false
      }
    }

    return true
  }

  isCorrectType(value: unknown) {
    if (typeof value !== 'object' || !value) {
      return false
    }

    if (this.typeName === 'object') {
      return this.compare(value as Record<string, unknown>)
    }

    return Object.values(value).every((v) => this.compare(v))
  }

  generateValue() {
    const obj: Record<string, unknown> = {}

    for (const property of this.properties) {
      obj[property.key] = property.type.generateValue()
    }

    return obj
  }
}

export class ObjectType<
  P extends Property[] = Property[]
> extends ObjectLikeType<P> {
  public typeName = 'object' as const
}

export function object<P extends Property[]>(
  properties: P,
  options?: { alias?: string }
) {
  return new ObjectType(properties, options)
}

export class RecordType<
  P extends Property[] = Property[]
> extends ObjectLikeType<P> {
  public typeName = 'record' as const
}

export function record<P extends Property[]>(
  properties: P,
  options?: { alias?: string }
) {
  return new RecordType(properties, options)
}
