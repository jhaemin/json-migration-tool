import { Type, valueToString } from './common'
import { Property } from './property'
import { camelCase } from 'change-case'

export class ObjectType<P extends Property[] = Property[]> implements Type {
  public typeName = 'object' as const
  public properties: P
  public alias?: string
  private options?: { alias?: string }

  constructor(properties: P, options?: { alias?: string }) {
    this.properties = properties
    this.alias = options?.alias
    this.options = options
  }

  _buildTsType(aliases: Map<string, string>) {
    let objStr = `{
${this.properties
  .map((property) => property._buildTsType(aliases))
  .join('; ')} }`

    if (this.alias !== undefined) {
      aliases.set(this.alias, objStr)

      return this.alias
    }

    return objStr
  }

  _raw(aliases: Map<string, string>) {
    const optionsString = valueToString(this.options)
    const objectSourceCode = `${this.typeName}([${this.properties
      .map((property) => property._raw(aliases))
      .join(', ')}]${optionsString ? `, ${optionsString}` : ''})`

    if (this.alias !== undefined) {
      const variableName = camelCase(this.alias)
      aliases.set(variableName, objectSourceCode)

      return variableName
    }

    return objectSourceCode
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

  addProperty(property: Property) {
    if (this.properties.findIndex(({ key }) => key === property.key) !== -1) {
      throw Error(`Property already exists. key: ${property.key}`)
    }

    this.properties.push(property)
  }

  removeProperty(key: string): Property | undefined {
    const index = this.properties.findIndex(
      ({ key: propertyKey }) => propertyKey === key
    )

    if (index === -1) {
      return
    }

    return this.properties.splice(index, 1)[0]
  }
}

export function object<P extends Property[]>(
  properties: P,
  options?: { alias?: string }
) {
  return new ObjectType(properties, options)
}
