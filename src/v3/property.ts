import { InferType } from './helpers'
import { Type } from './type'

export class Property<
  K extends string = string,
  T extends Type = Type,
  Opt extends boolean = boolean
> {
  public key: K
  public type: T
  public optional: Opt
  public defaultValue?: InferType<T>

  constructor(
    key: K,
    type: T,
    options?: { optional?: true; defaultValue: InferType<T> }
  ) {
    this.key = key
    this.type = type
    this.optional = (options?.optional ?? false) as Opt
    this.defaultValue = options?.defaultValue

    if (
      options?.defaultValue !== undefined &&
      this.isCorrectDefaultValue(options.defaultValue) === false
    ) {
      throw Error(
        `Default value doesn't fit to any type of property. (key: ${
          this.key
        })\nDefault value:\n${JSON.stringify(options.defaultValue, null, 2)}`
      )
    }
  }

  buildTsType(): string {
    return `${this.key}${this.optional ? '?' : ''}: ${this.type.buildTsType()}`
  }

  raw() {
    let optionsRaw = ''

    if (this.optional === true || this.defaultValue !== undefined) {
      optionsRaw += `, {`
    }

    if (this.optional === true) {
      optionsRaw += `
optional: ${this.optional},`
    }

    if (this.defaultValue !== undefined) {
      optionsRaw += `
defaultValue: ${JSON.stringify(this.defaultValue)},`
    }

    if (optionsRaw) {
      optionsRaw += ' }'
    }

    return `property('${this.key}', ${this.type.raw()}${optionsRaw})`
  }

  /**
   * Runtime check of default value.
   */
  isCorrectDefaultValue(value: InferType<T>) {
    return this.type.isCorrectType(value)
  }
}

export function property<K extends string, T extends Type, Opt extends boolean>(
  key: K,
  type: T,
  options?: { optional?: true; defaultValue: InferType<T> }
) {
  return new Property(key, type, options)
}
