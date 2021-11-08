import { Type, valueToString } from './common'
import { camelCase } from 'change-case'

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
    const unionStr = this.types
      .map((type) => type._buildTsType(aliases))
      .join(' | ')

    if (this.alias !== undefined) {
      aliases.set(this.alias, unionStr)

      return this.alias
    }

    return unionStr
  }

  _raw(aliases: Map<string, string>) {
    const optionsString = valueToString(this.options)
    const unionSourceCode = `union([
${this.types.map((type) => type._raw(aliases)).join(',\n')}
]${optionsString ? `, ${optionsString}` : ''})`

    if (this.alias !== undefined) {
      const variableName = camelCase(this.alias)
      aliases.set(variableName, unionSourceCode)

      return variableName
    }

    return unionSourceCode
  }

  isCorrectType(value: any) {
    return this.types.some((type) => type.isCorrectType(value))
  }
}

export function union<T extends Type[]>(
  types: T,
  options?: { alias?: string }
) {
  return new Union(types, options)
}
