import { Type, valueToString } from './common'
import { camelCase } from 'change-case'

export class TupleType<ItemTypes extends Type[] = Type[]> implements Type {
  public typeName: 'tuple' = 'tuple'
  public itemTypes: [...ItemTypes] // Variadic tuple types
  public alias?: string
  private options?: { alias?: string }

  constructor(itemTypes: ItemTypes, options?: { alias?: string }) {
    this.itemTypes = itemTypes
    this.alias = options?.alias
    this.options = options
  }

  _buildTsType(aliases: Map<string, string>) {
    return `[${this.itemTypes
      .map((itemType) => itemType._buildTsType(aliases))
      .join(', ')}]`
  }

  _raw(aliases: Map<string, string>) {
    const optionsString = valueToString(this.options)
    const tupleSourceCode = `${this.typeName}([${this.itemTypes
      .map((itemType) => itemType._raw(aliases))
      .join(', ')}]${optionsString ? `, ${optionsString}` : ''})`

    if (this.alias !== undefined) {
      const variableName = camelCase(this.alias)
      aliases.set(variableName, tupleSourceCode)

      return variableName
    }

    return tupleSourceCode
  }

  isCorrectType(value: unknown) {
    if (!Array.isArray(value)) {
      return false
    }

    return (
      this.itemTypes.length === value.length &&
      value.every((item, idx) => this.itemTypes[idx].isCorrectType(item))
    )
  }
}

export function tuple<ItemTypes extends Type[]>(
  itemTypes: [...ItemTypes],
  options?: { alias?: string }
) {
  return new TupleType(itemTypes, options)
}
