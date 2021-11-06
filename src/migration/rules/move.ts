import { JsonRuntimeSchema } from '../../jrs/common'
import { PropertyPath } from '../types'

export class Move<
  Schema extends JsonRuntimeSchema,
  At extends PropertyPath<Schema, true> = PropertyPath<Schema, true>
> {
  constructor(
    public options: {
      from: At
      to: {
        path: At | ''
        key: string
      }
    }
  ) {}
}

export function move<
  Schema extends JsonRuntimeSchema,
  At extends PropertyPath<Schema, true> = PropertyPath<Schema, true>
>(options: { from: At; to: { path: At | ''; key: string } }) {
  return new Move<Schema, At>(options)
}
