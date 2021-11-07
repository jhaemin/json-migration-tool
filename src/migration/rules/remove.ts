import { JsonRuntimeSchema } from '@/jrs'
import { PropertyPath } from '../types'

export class Remove<
  Schema extends JsonRuntimeSchema,
  At extends PropertyPath<Schema, true> = PropertyPath<Schema, true>
> {
  constructor(
    public options: {
      at: At
    }
  ) {}
}

export function remove<
  Schema extends JsonRuntimeSchema,
  At extends PropertyPath<Schema, true> = PropertyPath<Schema, true>
>(options: { at: At }) {
  return new Remove<Schema, At>(options)
}
