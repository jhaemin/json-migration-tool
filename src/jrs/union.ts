import { Type, valueToString } from './common'

export class Union<T extends Type[]> implements Type {
  public typeName = 'union' as const
  public types: T
  public alias?: string
  private options?: { alias?: string }

  constructor(types: T, options?: { alias?: string }) {
    this.types = types
    this.alias = options?.alias
    this.options = options
  }

  _buildTsType(aliases: Map<string, string>) {
    return this.types.map((type) => type._buildTsType(aliases)).join(' | ')
  }

  raw() {
    const optionsString = valueToString(this.options)

    return `union([
${this.types.map((type) => type.raw()).join(',\n')}
]${optionsString ? `, ${optionsString}` : ''})`
  }

  isCorrectType(value: unknown) {
    return this.types.some((type) => type.isCorrectType(value))
  }
}

export function union<T extends Type[]>(
  types: T,
  options?: { alias?: string }
) {
  return new Union(types, options)
}