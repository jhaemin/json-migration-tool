import { Type } from './common'

export class NullType implements Type {
  public typeName = 'null' as const

  buildTsType() {
    return 'null'
  }

  raw() {
    return 'nil()'
  }

  isCorrectType(value: unknown) {
    return value === null
  }

  generateValue() {
    return null
  }
}

export function nil() {
  return new NullType()
}
