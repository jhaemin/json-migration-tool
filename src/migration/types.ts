import { ArrayType } from '../jrs/array'
import { ObjectType } from '../jrs/object'
import { Property } from '../jrs/property'
import { RecordType } from '../jrs/record'

export type PropertyPath<S, IncludeLeaf extends boolean> = S extends ObjectType<
  infer Properties
>
  ? {
      [Idx in keyof Properties]: Idx extends number
        ? Properties[Idx] extends infer P
          ? P extends Property<infer PKey, infer PType>
            ? PType extends ObjectType
              ? `${PKey}` | `${PKey}.${PropertyPath<PType, IncludeLeaf>}`
              : PType extends ArrayType<infer ItemType>
              ? ItemType extends ObjectType
                ? `${PKey}` | `${PKey}.${PropertyPath<ItemType, IncludeLeaf>}`
                : never
              : PType extends RecordType<infer ValueType>
              ? ValueType extends ObjectType
                ? `${PKey}` | `${PKey}.${PropertyPath<ValueType, IncludeLeaf>}`
                : never
              : IncludeLeaf extends true
              ? PKey
              : never
            : never
          : never
        : never
    }[number]
  : never
