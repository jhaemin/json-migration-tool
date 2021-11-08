import { Type, valueToString } from './common'
import { camelCase } from 'change-case'

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

  _raw(aliases: Map<string, string>) {
    const optionsString = valueToString(this.options)
    const recordSourceCode = `${this.typeName}(${this.valueType._raw(aliases)}${
      optionsString ? `, ${optionsString}` : ''
    })`

    if (this.alias !== undefined) {
      const variablesName = camelCase(this.alias)
      aliases.set(variablesName, recordSourceCode)

      return variablesName
    }

    return recordSourceCode
  }

  isCorrectType(value: unknown) {
    if (typeof value !== 'object' || Array.isArray(value)) {
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
