import {
  ArrayType,
  BooleanType,
  NullType,
  NumberType,
  ObjectType,
  Property,
  RecordType,
  StringType,
  TupleType,
  Type,
  Union,
} from './'

export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never

export type Unpacked<T> = T extends (infer U)[] ? U : T

export type ArrayToUnion<A> = A extends [infer First, ...infer Rest]
  ? First | ArrayToUnion<Rest>
  : never

export type InferProperties<P> = P extends Property[]
  ? UnionToIntersection<
      {
        [Idx in keyof P]: Idx extends number
          ? P[Idx] extends infer P
            ? P extends Property<
                infer PropertyKey,
                infer PropertyType,
                infer Opt
              >
              ? Opt extends true
                ? {
                    [K in PropertyKey]?: InferType<PropertyType>
                  }
                : {
                    [K in PropertyKey]: InferType<PropertyType>
                  }
              : never
            : never
          : never
      }[number]
    >
  : never

export type InferTupleType<
  T extends Type[],
  Cache extends any[] = []
> = T extends [infer FirstType, ...infer RestType]
  ? FirstType extends Type
    ? RestType extends Type[]
      ? InferTupleType<RestType, [...Cache, InferType<FirstType>]>
      : Cache
    : Cache
  : Cache

export type InferType<T extends Type> = T extends StringType<infer Literal>
  ? Literal extends string
    ? Literal
    : string
  : T extends NumberType<infer Literal>
  ? Literal extends number
    ? Literal
    : number
  : T extends BooleanType<infer Literal>
  ? Literal extends boolean
    ? Literal
    : boolean
  : T extends NullType
  ? null
  : T extends ObjectType<infer Properties>
  ? InferProperties<Properties>
  : T extends RecordType<infer Properties>
  ? Record<string, InferProperties<Properties>>
  : T extends ArrayType<infer ItemType>
  ? InferType<ItemType>[]
  : T extends TupleType<infer ItemsType>
  ? InferTupleType<ItemsType>
  : T extends Union<infer TypeArray>
  ? TypeArray extends (infer T)[]
    ? T extends Type
      ? InferType<T>
      : never
    : never
  : never
