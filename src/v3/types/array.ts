import { Type } from './common'

export class ArrayType<ItemType extends Type = Type> implements Type {
  public typeName: 'array' = 'array'
  public itemType: ItemType
  public alias?: string

  constructor(itemType: ItemType, options?: { alias?: string }) {
    this.itemType = itemType
    this.alias = options?.alias
  }

  _buildTsType(aliases: Map<string, string>) {
    return `(${this.itemType._buildTsType(aliases)})[]`
  }

  raw() {
    return `${this.typeName}(${this.itemType.raw()})`
  }

  isCorrectType(value: unknown) {
    if (!Array.isArray(value)) {
      return false
    }

    return value.every((item) => this.itemType.isCorrectType(item))
  }

  generateValue() {
    return []
  }
}

export function array<ItemType extends Type = Type>(
  itemType: ItemType,
  options?: { alias?: string }
) {
  return new ArrayType(itemType, options)
}
