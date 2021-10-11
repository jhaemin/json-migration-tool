import { PrimitiveType } from './primitive'

export class NumberType<
  Literal extends number = number
> extends PrimitiveType<Literal> {
  public typeName = 'number' as const
}

export function number<Literal extends number = number>(
  defaultValue?: Literal
) {
  return new NumberType(defaultValue)
}
