import { PrimitiveType } from './primitive'

export class BooleanType<
  Literal extends boolean = boolean
> extends PrimitiveType<Literal> {
  public typeName = 'boolean' as const
}

export function boolean<Literal extends boolean = boolean>(
  defaultValue?: Literal
) {
  return new BooleanType(defaultValue)
}
