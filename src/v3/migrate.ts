import { add, Add } from './migration/rules/add'
import {
  array,
  ArrayType,
  JsonRuntimeSchema,
  number,
  object,
  ObjectLikeType,
  property,
  Property,
  record,
  string,
  Type,
  union,
} from './types'
import { InferType } from './types/helpers'

export type PropertyPath<S> = S extends ObjectLikeType<infer Properties>
  ? {
      [Idx in keyof Properties]: Idx extends number
        ? Properties[Idx] extends infer P
          ? P extends Property<infer PKey, infer PType>
            ? PType extends ObjectLikeType
              ? `${PKey}` | `${PKey}.${PropertyPath<PType>}`
              : PType extends ArrayType<infer ItemType>
              ? `${PKey}` | `${PKey}.${PropertyPath<ItemType>}`
              : never
            : never
          : never
        : never
    }[number]
  : never

export type MigrationAddRule<
  Schema extends JsonRuntimeSchema,
  T extends Type
> = {
  mode: 'add'
  property: string
  to: PropertyPath<Schema>
  type: T
  defaultValue: InferType<T> | ((json: InferType<Schema>) => InferType<T>)
}

export type MigrationRule<
  Schema extends JsonRuntimeSchema,
  T extends Type
> = MigrationAddRule<Schema, T>

class Migrator<Schema extends JsonRuntimeSchema> {
  constructor(private previousSchema: Schema, private rules: Add<Schema>[]) {}

  public migrate(data: unknown) {
    if (this.validate(data) === false) {
      throw Error(`Given data doesn't fit to the schema.`)
    }

    const migratedData = JSON.parse(JSON.stringify(data))

    for (const rule of this.rules) {
      if (rule instanceof Add) {
        // const keys = (rule.options.to as string).split('.')

        // More precise typings
        function test(
          objType: ObjectLikeType,
          obj: Record<string, unknown>,
          keys: string[],
          targetKey: string,
          value: any,
          indexes: string[]
        ) {
          if (keys.length === 0 || (keys.length === 1 && keys[0] === '')) {
            if (value === undefined) {
              throw Error(`You have to pass default value.`)
            }

            // obj[targetKey] = value
            if (typeof value === 'function') {
              obj[targetKey] = value(data, indexes)
            } else {
              obj[targetKey] = value
            }
          } else {
            const firstKey = keys[0]
            const nextProperty = objType.properties.find(
              ({ key }) => key === firstKey
            )!
            const nextKeys = [...keys]
            nextKeys.shift()

            if (objType.typeName === 'object') {
              test(
                nextProperty.type as ObjectLikeType,
                obj[firstKey] as Record<string, unknown>,
                nextKeys,
                targetKey,
                value,
                indexes
              )
            } else {
              const values = Object.entries<Record<string, unknown>>(
                obj as Record<string, Record<string, unknown>>
              )

              // console.log(values)

              for (const [index, o] of values) {
                console.log(index)
                test(
                  nextProperty.type as ObjectLikeType,
                  o[firstKey] as Record<string, unknown>,
                  nextKeys,
                  targetKey,
                  value,
                  [...indexes, index]
                )
              }
            }
          }
        }

        test(
          this.previousSchema,
          migratedData,
          (rule.options.at ?? '').split('.'),
          rule.options.property.key,
          rule.options.value,
          []
        )
      }
    }

    return migratedData
  }

  private validate(data: unknown) {
    return this.previousSchema.isCorrectType(data)
  }
}

export const sample = object([
  property('version', string()),
  property('info', object([property('createdAt', string())])),
  property(
    'blocks',
    record([
      property(
        'styles',
        object([property('padding', number()), property('margin', number())])
      ),
    ])
  ),
  property(
    'coupons',
    array(
      object([
        property('couponId', string()),
        property(
          'dist',
          object([property('prod', string()), property('beta', string())])
        ),
      ])
    )
  ),
])

const item = {
  foo: {
    bar: {
      hello: {
        test: 0,
        foo: {
          what: {
            great: 0,
          },
          good: {
            great: 0,
          },
        },
      },
      world: {
        test: 0,
        foo: {
          test: {
            great: 0,
          },
          test2: {
            great: 0,
          },
        },
      },
    },
  },
}

const migrator = new Migrator(sample, [
  add({
    property: property('boxShadow', string(), {
      defaultValue: 'what',
    }),
    at: 'blocks.styles',
    value: (json, indexes) => {
      const myStyles = json.blocks[indexes[0]].styles

      return (myStyles.padding + myStyles.margin).toString()
    },
  }),
])

const oldData: InferType<typeof sample> = {
  version: '1.0.0',
  info: {
    createdAt: '',
  },
  blocks: {
    '3DFJA': {
      styles: {
        padding: 3,
        margin: 10,
      },
    },
    '6KK87': {
      styles: {
        padding: 0,
        margin: 1,
      },
    },
  },
  coupons: [
    {
      couponId: '123',
      dist: {
        beta: '',
        prod: '',
      },
    },
  ],
}

const m = migrator.migrate(oldData)

console.log(JSON.stringify(m, null, 2))
