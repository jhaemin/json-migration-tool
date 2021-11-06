import { Type, valueToString } from './common'

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

  raw() {
    const optionsString = valueToString(this.options)

    return `${this.typeName}([${this.itemTypes
      .map((itemType) => itemType.raw())
      .join(', ')}]${optionsString ? `, ${optionsString}` : ''})`
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