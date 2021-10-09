// TODO: literal type

import { PrimitiveType } from './primitive'

export class StringType extends PrimitiveType {
  public typeName = 'string' as const
}

export function string(defaultValue?: string) {
  return new StringType(defaultValue)
}
