import { JsonRuntimeSchema, Type } from '../../jrs/common'
import { InferType } from '../../jrs/helpers'
import { PropertyPath } from '../types'

export class Change<
  Schema extends JsonRuntimeSchema,
  At extends PropertyPath<Schema, true> = PropertyPath<Schema, true>,
  T extends Type = Type
> {
  constructor(
    public options: {
      at: At
      type: T
      value:
        | InferType<T>
        | ((
            json: InferType<Schema>,
            indexes: (string | number)[]
          ) => InferType<T>)
    }
  ) {}
}

export function change<
  Schema extends JsonRuntimeSchema,
  At extends PropertyPath<Schema, true> = PropertyPath<Schema, true>,
  T extends Type = Type
>(options: {
  at: At
  type: T
  value:
    | InferType<T>
    | ((json: InferType<Schema>, indexes: (string | number)[]) => InferType<T>)
}) {
  return new Change(options)
}
