import { PrimitiveType } from './primitive'

export class NumberType extends PrimitiveType {
  public typeName = 'number' as const
}

export function number(defaultValue?: number) {
  return new NumberType(defaultValue)
}
