import { NumberType } from './number'
import { Property, RecordType } from './object'
import { StringType } from './string'
import { Type } from './type'

export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never

export type Unpacked<T> = T extends (infer U)[] ? U : T

export type ArrayToUnion<A> = A extends [infer First, ...infer Rest]
  ? First | ArrayToUnion<Rest>
  : never

// TODO: Support more types
export type InferType<T extends Type> = T extends StringType
  ? string
  : T extends NumberType
  ? number
  : T extends RecordType<infer P>
  ? UnionToIntersection<
      {
        [Idx in keyof T['properties']]: Idx extends number
          ? T['properties'][Idx] extends infer P
            ? P extends Property
              ? P['optional'] extends true
                ? {
                    [K in P['key']]?: InferType<P['type']>
                  }
                : {
                    [K in P['key']]: InferType<P['type']>
                  }
              : unknown
            : unknown
          : unknown
      }[number]
    >
  : unknown
