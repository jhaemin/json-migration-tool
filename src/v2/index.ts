import prettier from 'prettier'

export type Curr = {
  foo: {
    bar: string
  }
}

export type ObjectProperty = {
  key: string
  value: ValueType
  optional?: boolean
}

export type ObjectType = {
  type: 'object'
  properties: ObjectProperty[]
}

export type RecordType = {
  type: 'record'
  properties: ObjectProperty[]
}

export type ArrayType = {
  type: 'array'
  item: ValueType
}

export type StringType = {
  type: 'string'
  defaultValue?: string
}

export type NumberType = {
  type: 'number'
  defaultValue?: number
}

export type ValueType =
  | ObjectType
  | RecordType
  | ArrayType
  | StringType
  | NumberType

export type MigrationAddRule = {
  method: 'add'
  path: string
  value: ValueType
}
export type MigrationRemoveRule = {
  method: 'remove'
  path: string
}

export type MigrationRule = MigrationAddRule | MigrationRemoveRule

export type MigrationRuleSet = MigrationRule[]

export type ShapeOfJson = ObjectType | ArrayType

function makeTsTypeString(): string {
  return 'string'
}

function makeTsTypeNumber(): string {
  return 'number'
}

function makeTsTypeProperties(properties: ObjectProperty[]): string {
  return properties
    .map(
      ({ key, value, optional }) =>
        `${key}${optional ? '?' : ''}: ${makeTsType(value)}`
    )
    .join(', ')
}

function makeTsTypeObject(obj: ObjectType): string {
  return `{
${makeTsTypeProperties(obj.properties)}
}`
}

function makeTsTypeRecord(record: RecordType): string {
  return `Record<string, {
${makeTsTypeProperties(record.properties)}
}>`
}

function makeTsType(value: ValueType): string {
  const { type } = value

  switch (type) {
    case 'string':
      return makeTsTypeString()
    case 'number':
      return makeTsTypeNumber()
    case 'object':
      return makeTsTypeObject(value)
    case 'record':
      return makeTsTypeRecord(value)
    default:
      return ''
  }
}

function shapeToTsType(shape: ShapeOfJson, typeAlias: string) {
  return prettier.format(`type ${typeAlias} = ${makeTsType(shape)}`, {
    parser: 'typescript',
    useTabs: false,
    tabWidth: 2,
    singleQuote: true,
    semi: false,
  })
}

const currShape: ShapeOfJson = {
  type: 'object',
  properties: [
    {
      key: 'foo',
      value: {
        type: 'string',
      },
    },
    {
      key: 'bar',
      value: {
        type: 'object',
        properties: [
          {
            key: 'hello',
            value: {
              type: 'string',
            },
          },
          {
            key: 'world',
            value: {
              type: 'number',
            },
            optional: true,
          },
        ],
      },
    },
  ],
}

const t = shapeToTsType(currShape, 'meta')

const tsType = prettier.format(t, {
  parser: 'typescript',
  useTabs: false,
  tabWidth: 2,
  singleQuote: true,
  semi: false,
})

// console.log(tsType)

type meta = {
  foo: string
  bar: {
    hello: string
    world?: number
  }
}

const migrationRuleSet: MigrationRuleSet = [
  {
    method: 'add',
    path: 'bar.test',
    value: {
      type: 'object',
      properties: [
        {
          key: 'bar',
          value: {
            type: 'string',
          },
        },
      ],
    },
  },
  {
    method: 'add',
    path: 'bar.test.foo',
    value: {
      type: 'string',
    },
  },
]

function migrateShape(
  currShape: ShapeOfJson,
  ruleSet: MigrationRuleSet
): ShapeOfJson {
  const nextShape = JSON.parse(JSON.stringify(currShape)) as ShapeOfJson

  ruleSet.forEach((rule) => {
    const { method } = rule

    if (method === 'add') {
      const { path, value: ruleValue } = rule
      const pathKeys = path.split('.')

      let value: ValueType = nextShape as ValueType

      pathKeys.forEach((key, idx) => {
        if (value.type === 'object') {
          let keyExists = false

          for (const property of value.properties) {
            if (property.key === key) {
              keyExists = true
              value = property.value
              break
            }
          }

          if (keyExists === false) {
            if (idx === pathKeys.length - 1) {
              if (value.type !== 'object') {
                throw Error(`Could not add to non-object value.`)
              }

              value.properties.push({
                key,
                value: ruleValue,
              })
            } else {
              throw Error(`Could not find the key "${key}".`)
            }
          } else {
            if (idx === pathKeys.length - 1) {
              throw Error(`The key "${key}" already exists.`)
            }
          }
        } else {
          if (idx === pathKeys.length - 1) {
            throw Error(`Could not add to non-object value. 33333`)
          } else {
            throw Error(`Could not locate to key "${key}" of a non-object.`)
          }
        }
      })
    }
  })

  return nextShape
}

;(function () {
  try {
    const newShape = migrateShape(currShape, migrationRuleSet)

    console.log(JSON.stringify(newShape, null, 2))
    console.log(shapeToTsType(newShape, 'NewShape'))
  } catch (error) {
    console.log(error)
  }
})()
