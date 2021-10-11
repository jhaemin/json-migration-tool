import { PrimitiveType } from './primitive'

export class StringType<
  Literal extends string = string
> extends PrimitiveType<Literal> {
  public typeName = 'string' as const
}

export function string<Literal extends string = string>(
  defaultValue?: Literal
) {
  return new StringType(defaultValue)
}
