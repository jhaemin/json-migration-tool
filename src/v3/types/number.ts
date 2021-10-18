import { PrimitiveType } from './primitive'

export class NumberType<
  Literal extends number = number
> extends PrimitiveType<Literal> {
  public typeName = 'number' as const
}

export function number<Literal extends number = number>(literal?: Literal) {
  return new NumberType(literal)
}
