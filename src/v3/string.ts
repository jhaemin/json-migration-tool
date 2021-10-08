import { Primitive } from './type'

// TODO: literal type

export class String extends Primitive {
  public typeName = 'string' as const
}

export function string(defaultValue?: string) {
  return new String(defaultValue)
}
