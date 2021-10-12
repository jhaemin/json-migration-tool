import { PropertyPath } from 'src/v3/migrate'
import { JsonRuntimeSchema, ObjectLikeType, Property, Type } from 'src/v3/types'
import { InferType } from 'src/v3/types/helpers'

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

export class Add<
  Schema extends JsonRuntimeSchema,
  P extends Property = Property,
  At extends PropertyPath<Schema> = PropertyPath<Schema>
> {
  constructor(
    public options: {
      property: P
      at?: At
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
  At extends PropertyPath<Schema> = PropertyPath<Schema>
>(options: {
  property: P
  at?: At
  value:
    | InferType<P['type']>
    | ((
        json: InferType<Schema>,
        indexes: (string | number)[]
      ) => InferType<P['type']>)
}) {
  return new Add(options)
}