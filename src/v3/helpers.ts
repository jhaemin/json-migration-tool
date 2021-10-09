import { NumberType } from './number'
import { ObjectType, RecordType } from './object'
import { Property } from './property'
import { StringType } from './string'
import { Type } from './type'
import { Union } from './union'

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
            ? P extends Property
              ? P['optional'] extends true
                ? {
                    [K in P['key']]?: InferType<P['type']>
                  }
                : {
                    [K in P['key']]: InferType<P['type']>
                  }
              : never
            : never
          : never
      }[number]
    >
  : never

// TODO: Support more types
export type InferType<T extends Type> = T extends StringType
  ? string
  : T extends NumberType
  ? number
  : T extends ObjectType<infer Property>
  ? InferProperties<T['properties']>
  : T extends RecordType<infer Property>
  ? Record<string, InferProperties<T['properties']>>
  : T extends Union<infer TypeArray>
  ? TypeArray extends (infer T)[]
    ? T extends Type
      ? InferType<T>
      : never
    : never
  : never
