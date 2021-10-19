import { InferType } from './helpers'
import { Type } from './common'

export class Property<
  K extends string = string,
  T extends Type = Type,
  Opt extends boolean | undefined = boolean | undefined
> {
  public key: K
  public type: T
  public optional: Opt
  public defaultValue?: InferType<T>

  constructor(
    key: K,
    type: T,
    options?: { optional?: Opt; defaultValue?: InferType<T> }
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

  _buildTsType(aliases: Map<string, string>): string {
    const comment =
      this.defaultValue !== undefined
        ? `/**
* @default ${JSON.stringify(this.defaultValue, null)}
*/
`
        : ''

    return `${comment}${this.key}${
      this.optional ? '?' : ''
    }: ${this.type._buildTsType(aliases)}`
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
defaultValue: ${JSON.stringify(this.defaultValue, null, 2)},`
    }

    if (optionsRaw) {
      optionsRaw += ' }'
    }

    return `property('${this.key}', ${this.type.raw()}${optionsRaw})`
  }

  isCorrectDefaultValue(value: InferType<T>) {
    return this.type.isCorrectType(value)
  }
}

export function property<
  K extends string,
  T extends Type,
  Opt extends boolean | undefined
>(key: K, type: T, options?: { optional?: Opt; defaultValue?: InferType<T> }) {
  return new Property(key, type, options)
}
