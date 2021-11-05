import { add, Add } from './migration/rules/add'
import { changeType, ChangeType } from './migration/rules/change-type'
import { Remove, remove } from './migration/rules/remove'
import {
  array,
  ArrayType,
  JsonRuntimeSchema,
  number,
  object,
  ObjectType,
  property,
  Property,
  record,
  RecordType,
  string,
  union,
} from './types'
import { InferType } from './types/helpers'

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

function pathToKeys(path: string) {
  const regExp = /\[[0-9]+\]$/g

  return path
    .split('.')
    .map((item) => {
      if (item.search(regExp) !== -1) {
        return item.replace(/\]$/g, '').split('[')
      }

      return item
    })
    .flat()
}

function isNumberString(str: string) {
  return Number(str).toString() === str
}

function testObject(props: {
  jrs: ObjectType
  obj: Record<string, any>
  keys: string[]
  onEnd?: (obj: Record<string, any>, indexes: (string | number)[]) => void
  onBeforeEnd?: (
    obj: Record<string, any>,
    lastKey: string,
    indexes: (string | number)[]
  ) => void
  indexes: (string | number)[]
}) {
  const { jrs, obj, keys, onEnd, onBeforeEnd, indexes } = props

  if (jrs.isCorrectType(obj) === false) {
    throw Error('Given obj has a different structure from the given JRS.')
  }

  // Last key
  if (keys.length === 0) {
    onEnd?.(obj as object, [...indexes])
    return
  }

  // Before the last key,
  // if the onBeforeEnd exists, execute it and early return.
  if (keys.length === 1 && onBeforeEnd !== undefined) {
    onBeforeEnd(obj as object, keys[0], [...indexes])
    return
  }

  const currentKey = keys.shift()

  // Empty keys
  if (currentKey === '' || currentKey === undefined) {
    onEnd?.(obj as object, [...indexes])
    return
  }

  const nextObj = obj[currentKey]
  const nextJrs = jrs.properties.find(({ key }) => key === currentKey)?.type

  if (!nextObj || !nextJrs) {
    throw Error(`Given key doesn't exist. key: ${currentKey}`)
  }

  if (nextJrs.typeName === 'object') {
    testObject({
      jrs: nextJrs as ObjectType,
      obj: nextObj,
      keys: [...keys],
      onEnd,
      onBeforeEnd,
      indexes: [...indexes],
    })
  } else if (nextJrs.typeName === 'record') {
    console.log('record')
    Object.entries(nextObj).forEach(([recordKey, value]) => {
      const nextIndexes = [...indexes]
      nextIndexes.push(recordKey)

      testObject({
        jrs: (nextJrs as RecordType).valueType as ObjectType,
        obj: value as Record<string, any>,
        keys: [...keys],
        onEnd,
        onBeforeEnd,
        indexes: nextIndexes,
      })
    })
  } else if (nextJrs.typeName === 'array') {
    ;(nextObj as Array<any>).forEach((item, i) => {
      const nextIndexes = [...indexes]
      nextIndexes.push(i)

      testObject({
        jrs: (nextJrs as ArrayType).itemType as ObjectType,
        obj: item as Record<string, any>,
        keys: [...keys],
        onEnd,
        onBeforeEnd,
        indexes: nextIndexes,
      })
    })
  } else {
    throw Error(`Unsupported JRS. JRS type: ${jrs.typeName}. ${nextObj}`)
  }
}

class Migrator<Schema extends JsonRuntimeSchema> {
  constructor(
    private previousSchema: Schema,
    private rules: (Add<Schema> | Remove<Schema> | ChangeType<Schema>)[]
  ) {}

  public migrate(data: InferType<typeof this.previousSchema>) {
    // Validate the data first
    if (this.validate(data) === false) {
      throw Error(`Given data doesn't fit to the schema.`)
    }

    const migratedData = JSON.parse(JSON.stringify(data))
    // Clone previous schema for the next schema
    // const newSchema

    for (const rule of this.rules) {
      const keys = (rule.options.at as string).split('.')
      const commonArgs = {
        jrs: this.previousSchema,
        obj: migratedData,
        keys,
        indexes: [],
      }

      if (rule instanceof Add) {
        console.log('add')
        testObject({
          ...commonArgs,
          onEnd: (obj, indexes) => {
            // If the property is optional and the given value is undefined,
            // don't add the property
            if (
              rule.options.property.optional === true &&
              rule.options.value === undefined
            ) {
              return
            }

            // Add the property
            // - if the value is function -> execute
            // - else: assign the value
            obj[rule.options.property.key] =
              typeof rule.options.value === 'function'
                ? rule.options.value(JSON.parse(JSON.stringify(data)), indexes)
                : rule.options.value
          },
        })
      } else if (rule instanceof Remove) {
        testObject({
          ...commonArgs,
          onBeforeEnd: (obj, lastKey) => {
            delete obj[lastKey]
          },
        })
      } else if (rule instanceof ChangeType) {
        testObject({
          ...commonArgs,
          onBeforeEnd: (obj, lastKey, indexes) => {
            obj[lastKey] =
              typeof rule.options.value === 'function'
                ? rule.options.value(JSON.parse(JSON.stringify(data)), indexes)
                : rule.options.value
          },
        })
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
    'sections',
    array(
      object([
        property('what', string()),
        property('hello', array(object([property('test', number())]))),
      ])
    )
  ),
  property(
    'blocks',
    record(
      object([
        property(
          'styles',
          object([
            property('padding', number()),
            property('margin', number()),
            property('gap', object([property('top', number())])),
          ])
        ),
      ])
    )
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
  property('stringRecord', record(string())),
])

const migrator = new Migrator(sample, [
  add({
    property: property('boxShadow', union([string(), number()]), {
      defaultValue: 'what',
    }),
    at: 'sections.hello',
    value: 'hello',
  }),
  remove({ at: 'sections.hello' }),
])

const oldData: InferType<typeof sample> = {
  version: '1.0.0',
  sections: [{ what: 'what', hello: [{ test: 0 }] }],
  info: {
    createdAt: '',
  },
  blocks: {
    '3DFJA': {
      styles: {
        padding: 3,
        margin: 10,
        gap: {
          top: 1,
        },
      },
    },
    '6KK87': {
      styles: {
        padding: 0,
        margin: 1,
        gap: {
          top: 3,
        },
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
    {
      couponId: '333',
      dist: {
        beta: 'ddd',
        prod: 'zzz',
      },
    },
  ],
  stringRecord: {
    dd: 'dd',
  },
}

// testObject({
//   jrs: sample,
//   obj: oldData,
//   keys: pathToKeys('coupons.dist'),
//   onEnd: (obj) => {
//     console.log(obj)
//   },
// })

const m = migrator.migrate(oldData)

console.log(JSON.stringify(m, null, 2))

type Test<T> = T extends Record<string, unknown>
  ? string extends keyof T
    ? 'record'
    : 'object'
  : 'object'

type A = Test<Record<string, unknown>>
