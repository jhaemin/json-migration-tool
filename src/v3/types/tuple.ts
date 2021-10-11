import { Type } from './common'

export class TupleType<ItemTypes extends Type[] = Type[]> implements Type {
  public typeName: 'tuple' = 'tuple'
  public itemTypes: [...ItemTypes] // Variadic tuple types
  public alias?: string

  constructor(itemTypes: ItemTypes, options?: { alias?: string }) {
    this.itemTypes = itemTypes
    this.alias = options?.alias
  }

  buildTsType() {
    return `[${this.itemTypes
      .map((itemType) => itemType.buildTsType())
      .join(', ')}]`
  }

  raw() {
    return `${this.typeName}([${this.itemTypes
      .map((itemType) => itemType.raw())
      .join(', ')}])`
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

  generateValue() {
    return []
  }
}

export function tuple<ItemTypes extends Type[]>(
  itemTypes: [...ItemTypes],
  options?: { alias?: string }
) {
  return new TupleType(itemTypes, options)
}
