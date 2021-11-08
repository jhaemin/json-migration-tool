import { Type, valueToString } from './common'
import { ObjectType } from './object'
import { camelCase } from 'change-case'

export class Intersection<T extends ObjectType[]> implements Type {
  public typeName = 'intersection' as const
  public types: T
  public alias?: string
  private options?: { alias?: string }

  constructor(
    types: T,
    options?: {
      alias?: string
    }
  ) {
    this.types = types
    this.alias = options?.alias
    this.options = options
  }

  _buildTsType(aliases: Map<string, string>) {
    const intersectionStr = this.types
      .map((type) => type._buildTsType(aliases))
      .join(' & ')

    if (this.alias !== undefined) {
      aliases.set(this.alias, intersectionStr)

      return this.alias
    }

    return intersectionStr
  }

  _raw(aliases: Map<string, string>) {
    const optionsString = valueToString(this.options)
    const intersectionSourceCode = `intersection([
${this.types.map((type) => type._raw(aliases)).join(',\n')}
]${optionsString ? `, ${optionsString}` : ''})`

    if (this.alias !== undefined) {
      const variableName = camelCase(this.alias)
      aliases.set(variableName, intersectionSourceCode)

      return variableName
    }

    return intersectionSourceCode
  }

  isCorrectType(value: any) {
    return this.types.every((type) => type.isCorrectType(value))
  }
}

export function intersection<T extends ObjectType[]>(
  types: T,
  options?: { alias?: string }
) {
  return new Intersection(types, options)
}
