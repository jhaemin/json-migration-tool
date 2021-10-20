import prettier from 'prettier'
import {
  JsonRuntimeSchema,
  nil,
  number,
  object,
  property,
  record,
  string,
  tuple,
  union,
} from './types'

const json = object(
  [
    property('foo', union([number(), nil()])),
    property(
      'hello',
      record(
        object([
          property('test', tuple([string(''), number(4)])),
          property(
            'world',
            union([
              number(),
              string(),
              record(
                object([
                  property('what', string(), {
                    optional: true,
                    defaultValue: '',
                  }),
                ])
              ),
            ]),
            {
              optional: true,
              defaultValue: 3,
            }
          ),
          property(
            'testKey',
            union([
              record(object([property('job', number(0))])),
              record(object([property('good', number(0))])),
            ])
          ),
        ]),
        { alias: 'Hello' }
      )
    ),
  ],
  {
    alias: 'Meta',
  }
)

export const sample = object([
  property('version', string()),
  property('info', object([property('createdAt', string())])),
  property(
    'blocks',
    record(
      object(
        [
          property(
            'styles',
            object([
              property('padding', number()),
              property('margin', number()),
            ])
          ),
        ],
        { alias: 'Block' }
      )
    )
  ),
])

// console.log(JSON.stringify(json.raw(), null, 2))

const prettierOptions: prettier.Options = {
  parser: 'typescript',
  useTabs: false,
  tabWidth: 2,
  singleQuote: true,
  semi: false,
  trailingComma: 'es5',
}

function buildTsType(json: JsonRuntimeSchema) {
  return prettier.format(
    `type ${json.alias ?? 'Json'} = ${json.buildTsType()}`,
    prettierOptions
  )
}

// console.log(buildTsType(sample))

function raw(json: JsonRuntimeSchema) {
  return prettier.format(json.raw(), prettierOptions)
}

// console.log(buildTsType(json))

// console.log(json.raw())
// console.log(raw(json))
// console.log(buildTsType(json))
