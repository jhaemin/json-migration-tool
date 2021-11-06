import { JsonRuntimeSchema } from '../../jrs/common'
import { InferType } from '../../jrs/helpers'
import { Property } from '../../jrs/property'
import { PropertyPath } from '../types'

/**
 * 'a.b.c' -> ['a', 'b', 'c']
 */
type Split<
  Str,
  Cache extends string[] = []
> = Str extends `${infer Method}.${infer Rest}`
  ? Split<Rest, [...Cache, Method]>
  : Str extends `${infer Last}`
  ? [...Cache, Last]
  : never

/**
 * Find object value from ['a', 'b', 'c', ...]
 */
type ValueByKeyPathArr<Obj, KeyPathArr> = KeyPathArr extends [
  infer ObjKey,
  infer Rest
]
  ? ObjKey extends keyof Obj
    ? ValueByKeyPathArr<Obj[ObjKey], [Rest]>
    : never
  : KeyPathArr extends [infer ObjKey]
  ? ObjKey extends keyof Obj
    ? Obj[ObjKey]
    : never
  : never

/**
 * Find object value from 'a.b.c...'
 */
type ValueByKeyPathStr<Obj, Str> = Str extends string
  ? ValueByKeyPathArr<Obj, Split<Str>>
  : never

/**
 * Rules
 * - If the property key already exists -> override
 * - If the property is optional and value is undefined -> don't add the property
 */
export class Add<
  Schema extends JsonRuntimeSchema,
  P extends Property = Property,
  At extends PropertyPath<Schema, false> = PropertyPath<Schema, false>
> {
  constructor(
    public options: {
      property: P
      at: At | ''
      value:
        | InferType<P['type']>
        | ((
            json: InferType<Schema>,
            indexes: (string | number)[]
          ) => InferType<P['type']>)
    }
  ) {}
}

export function add<
  Schema extends JsonRuntimeSchema,
  P extends Property,
  At extends PropertyPath<Schema, false> = PropertyPath<Schema, false>
>(options: {
  property: P
  at: At | ''
  value:
    | InferType<P['type']>
    | ((
        json: InferType<Schema>,
        indexes: (string | number)[]
      ) => InferType<P['type']>)
}) {
  return new Add(options)
}
