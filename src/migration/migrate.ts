import { buildTsType } from '..'
import { array, ArrayType } from '../jrs/array'
import { JsonRuntimeSchema } from '../jrs/common'
import { InferType } from '../jrs/helpers'
import { number } from '../jrs/number'
import { object, ObjectType } from '../jrs/object'
import { Property, property } from '../jrs/property'
import { record, RecordType } from '../jrs/record'
import { string } from '../jrs/string'
import { union } from '../jrs/union'
import { add, Add } from './rules/add'
import { change, Change } from './rules/change'
import { move, Move } from './rules/move'
import { Remove, remove } from './rules/remove'

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
  onEnd?: (
    obj: Record<string, any>,
    jrs: ObjectType,
    indexes: (string | number)[]
  ) => void
  onBeforeEnd?: (
    obj: Record<string, any>,
    jrs: ObjectType,
    lastKey: string,
    indexes: (string | number)[]
  ) => void
  indexes: (string | number)[]
  bypassValidation?: boolean
}) {
  const { jrs, obj, keys, onEnd, onBeforeEnd, indexes } = props

  if (jrs.isCorrectType(obj) === false) {
    throw Error('Given obj has a different structure from the given JRS.')
  }

  // Last key
  if (keys.length === 0) {
    onEnd?.(obj as object, jrs, [...indexes])
    return
  }

  // Before the last key,
  // if the onBeforeEnd exists, execute it and early return.
  if (keys.length === 1 && onBeforeEnd !== undefined) {
    onBeforeEnd(obj as object, jrs, keys[0], [...indexes])
    return
  }

  const currentKey = keys.shift()

  // Empty keys
  if (currentKey === '' || currentKey === undefined) {
    onEnd?.(obj as object, jrs, [...indexes])
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

export class Migrator<Schema extends JsonRuntimeSchema> {
  constructor(
    private previousSchema: Schema,
    private rules: (
      | Add<Schema>
      | Remove<Schema>
      | Change<Schema>
      | Move<Schema>
    )[]
  ) {}

  public migrate(data: InferType<Schema>): {
    data: any
    jrs: JsonRuntimeSchema
  } {
    // Validate the data first
    if (this.validate(data) === false) {
      throw Error(`Given data doesn't fit to the schema.`)
    }

    const migratedData = JSON.parse(JSON.stringify(data))
    // Clone previous schema for the next schema
    // const newSchema

    for (const rule of this.rules) {
      if (rule instanceof Move) {
        const fromKeys = (rule.options.from as string).split('.')
        const toKeys = (rule.options.to.path as string).split('.')

        let tempData: any = undefined
        let tempProperty: Property | undefined = undefined
        let targetJrs: ObjectType | undefined = undefined
        let targetKey: string = ''

        testObject({
          jrs: this.previousSchema,
          obj: migratedData,
          keys: fromKeys,
          indexes: [],
          onBeforeEnd: (obj, jrs, lastKey) => {
            targetJrs = jrs
            targetKey = lastKey
            tempData = obj[lastKey]
            delete obj[lastKey]
          },
        })

        if (targetJrs) {
          tempProperty = (targetJrs as ObjectType).removeProperty(targetKey)
        }

        testObject({
          jrs: this.previousSchema,
          obj: migratedData,
          keys: toKeys,
          indexes: [],
          onEnd: (obj, jrs) => {
            obj[rule.options.to.key] = tempData
            targetJrs = jrs
          },
        })

        if (targetJrs && tempProperty) {
          tempProperty.key = rule.options.to.key
          ;(targetJrs as ObjectType).addProperty(tempProperty)
        }
      } else {
        const keys = (rule.options.at as string).split('.')
        const commonArgs = {
          jrs: this.previousSchema,
          obj: migratedData,
          keys,
          indexes: [],
        }

        if (rule instanceof Add) {
          let targetJrs: ObjectType | undefined = undefined

          testObject({
            ...commonArgs,
            onEnd: (obj, jrs, indexes) => {
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
              const value =
                typeof rule.options.value === 'function'
                  ? rule.options.value(
                      JSON.parse(JSON.stringify(data)),
                      indexes
                    )
                  : rule.options.value

              if (!rule.options.property.type.isCorrectType(value)) {
                throw Error(`Incorrect type of value. value: ${value}`)
              }

              obj[rule.options.property.key] = value

              targetJrs = jrs
            },
          })

          if (targetJrs) {
            ;(targetJrs as ObjectType).addProperty(rule.options.property)
          }
        } else if (rule instanceof Remove) {
          let targetJrs: ObjectType | undefined = undefined
          let targetKey: string = ''

          testObject({
            ...commonArgs,
            onBeforeEnd: (obj, jrs, lastKey) => {
              targetJrs = jrs
              targetKey = lastKey
              delete obj[lastKey]
            },
          })

          if (targetJrs) {
            ;(targetJrs as ObjectType).removeProperty(targetKey)
          }
        } else if (rule instanceof Change) {
          let targetJrs: ObjectType | undefined = undefined
          let targetKey: string = ''

          testObject({
            ...commonArgs,
            onBeforeEnd: (obj, jrs, lastKey, indexes) => {
              targetJrs = jrs
              targetKey = lastKey

              const value =
                typeof rule.options.value === 'function'
                  ? rule.options.value(
                      JSON.parse(JSON.stringify(data)),
                      indexes
                    )
                  : rule.options.value

              if (!rule.options.type.isCorrectType(value)) {
                throw Error(`Incorrect type of value. value: ${value}`)
              }

              obj[lastKey] = value
            },
          })

          if (targetJrs) {
            ;(targetJrs as ObjectType).properties[
              (targetJrs as ObjectType).properties.findIndex(
                ({ key }) => key === targetKey
              )
            ].updateType(rule.options.type)
          }
        }
      }
    }

    return {
      data: migratedData,
      jrs: this.previousSchema,
    }
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
    value: (json, indexes) => {
      return json.sections[indexes[0] as number].what
    },
  }),
  remove({ at: 'sections.hello.test' }),
  change({
    at: 'blocks.styles',
    type: record(number()),
    value: (json) => {
      const obj: Record<string, number> = {}
      Object.entries(json.blocks).forEach(([key, value]) => {
        obj[key] = value.styles.padding
      })
      return obj
    },
  }),
  move({
    from: 'blocks',
    to: {
      path: '',
      key: 'myBlocks',
    },
  }),
])

const oldData: InferType<typeof sample> = {
  version: '1.0.0',
  sections: [
    { what: 'what', hello: [{ test: 0 }] },
    { what: 'what2', hello: [{ test: 1 }, { test: 2 }] },
  ],
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

// const { data: m, jrs } = migrator.migrate(oldData)

// console.log(JSON.stringify(m, null, 2))
// console.log(buildTsType(jrs))

type Test<T> = T extends Record<string, unknown>
  ? string extends keyof T
    ? 'record'
    : 'object'
  : 'object'

type A = Test<Record<string, unknown>>
