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

  buildTsType() {
    return `Record<string, ${this.valueType.buildTsType()}>`
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

    return Object.values(value).every((v) => this.valueType.isCorrectType(v))
  }
}

export function record<ValueType extends Type>(
  valueType: ValueType,
  options?: { alias?: string }
) {
  return new RecordType(valueType, options)
}