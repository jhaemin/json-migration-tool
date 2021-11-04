import { AllPropertyPath } from 'src/v3/migrate'
import { JsonRuntimeSchema, Type } from 'src/v3/types'
import { InferType } from 'src/v3/types/helpers'

export class ChangeType<
  Schema extends JsonRuntimeSchema,
  At extends AllPropertyPath<Schema> = AllPropertyPath<Schema>,
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

export function changeType<
  Schema extends JsonRuntimeSchema,
  At extends AllPropertyPath<Schema> = AllPropertyPath<Schema>,
  T extends Type = Type
>(options: {
  at: At
  type: T
  value:
    | InferType<T>
    | ((json: InferType<Schema>, indexes: (string | number)[]) => InferType<T>)
}) {
  return new ChangeType(options)
}
