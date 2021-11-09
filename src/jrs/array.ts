import { Type } from './common'
import { camelCase } from 'change-case'

export class ArrayType<ItemType extends Type = Type> implements Type {
  public typeName: 'array' = 'array'
  public itemType: ItemType
  public alias?: string

  constructor(itemType: ItemType, options?: { alias?: string }) {
    this.itemType = itemType
    this.alias = options?.alias
  }

  _buildTsType(aliases: Map<string, string>) {
    const arrayStr = `(${this.itemType._buildTsType(aliases)})[]`

    if (this.alias !== undefined) {
      aliases.set(this.alias, arrayStr)

      return this.alias
    }

    return arrayStr
  }

  _buildSourceCode(aliases: Map<string, string>) {
    const arraySourceCode = `${this.typeName}(${this.itemType._buildSourceCode(
      aliases
    )})`

    if (this.alias !== undefined) {
      const variableName = camelCase(this.alias)
      aliases.set(variableName, arraySourceCode)

      return variableName
    }

    return arraySourceCode
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
