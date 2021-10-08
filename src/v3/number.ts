import { Primitive } from './type'

export class Number extends Primitive {
  public typeName = 'string' as const
}

export function number(defaultValue?: number) {
  return new Number(defaultValue)
}
