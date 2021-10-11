import { Type } from './common'

export class Union<T extends Type[]> implements Type {
  public typeName = 'union' as const
  public types: T
  public alias?: string
  public options?: {
    alias?: string
  }

  constructor(types: T, options?: { alias?: string }) {
    this.types = types
    this.alias = options?.alias
    this.options = options
  }

  buildTsType() {
    return this.types.map((type) => type.buildTsType()).join(' | ')
  }

  raw() {
    let optionsRaw = ''

    const options = this.options ?? {}

    optionsRaw = Object.keys(options)
      .map(
        (key) =>
          `${key}: ${JSON.stringify(options[key as keyof typeof options])}`
      )
      .join(',\n')

    if (optionsRaw !== '') {
      optionsRaw = `, {
        ${optionsRaw}
      }`
    }

    return `union([
${this.types.map((type) => type.raw()).join(',\n')}
]${optionsRaw})`
  }

  isCorrectType(value: unknown) {
    return this.types.some((type) => type.isCorrectType(value))
  }

  generateValue() {
    return this.types[0].generateValue()
  }
}

export function union<T extends Type[]>(
  types: T,
  options?: { alias?: string }
) {
  return new Union(types, options)
}
