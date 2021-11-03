import { AllPropertyPath } from 'src/v3/migrate'
import { JsonRuntimeSchema } from 'src/v3/types'

export class Remove<
  Schema extends JsonRuntimeSchema,
  At extends AllPropertyPath<Schema> = AllPropertyPath<Schema>
> {
  constructor(
    public options: {
      at: At
    }
  ) {}
}

export function remove<
  Schema extends JsonRuntimeSchema,
  At extends AllPropertyPath<Schema> = AllPropertyPath<Schema>
>(options: { at: At }) {
  return new Remove<Schema, At>(options)
}
