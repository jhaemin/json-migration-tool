import { valueToString } from '.'
import { Type } from './common'

export class RecordType<ValueType extends Type = Type> implements Type {
  public typeName = 'record' as const
  public valueType: ValueType
  public alias?: string
  private options?: { alias?: string }

  constructor(valueType: ValueType, options?: { alias?: string }) {
    this.valueType = valueType
    this.alias = options?.alias
    this.options = options
  }

  _buildTsType(aliases: Map<string, string>) {
    const recordStr = `Record<string, ${this.valueType._buildTsType(aliases)}>`

    if (this.alias !== undefined) {
      aliases.set(this.alias, recordStr)

      return this.alias
    }

    return recordStr
  }

  raw() {
    const optionsString = valueToString(this.options)

    return `${this.typeName}(${this.valueType.raw()}${
      optionsString ? `, ${optionsString}` : ''
    })`
  }

  isCorrectType(value: unknown) {
    if (typeof value !== 'object') {
      return false
    }

    if (value === null || value === undefined) {
      return false
    }

    return Object.entries(value).every(
      ([k, v]) => typeof k === 'string' && this.valueType.isCorrectType(v)
    )
  }
}

export function record<ValueType extends Type>(
  valueType: ValueType,
  options?: { alias?: string }
) {
  return new RecordType(valueType, options)
}
