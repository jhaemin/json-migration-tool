import prettier from 'prettier'
import { JsonRuntimeSchema } from './jrs/common'
import { nil } from './jrs/null'
import { number } from './jrs/number'
import { object } from './jrs/object'
import { property } from './jrs/property'
import { record } from './jrs/record'
import { string } from './jrs/string'
import { tuple } from './jrs/tuple'
import { union } from './jrs/union'

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

export function buildTsType(json: JsonRuntimeSchema) {
  const aliases: Map<string, string> = new Map()
  const rootTypeStr = json._buildTsType(aliases, true)

  let typeStr = ''

  aliases.forEach((value, key) => {
    typeStr += `type ${key} = ${value}\n\n`
  })

  return prettier.format(typeStr, prettierOptions)
}

export function buildJrsSourceCode(jrs: JsonRuntimeSchema) {
  const aliases: Map<string, string> = new Map()
  jrs._raw(aliases)

  let sourceCode = ''

  aliases.forEach((value, key) => {
    sourceCode += `${
      key === camelCase(jrs.alias ?? '') ? 'export ' : ''
    }const ${key} = ${value}\n\n`
  })

  return prettier.format(sourceCode, prettierOptions)
}

export function isJRS(value: any) {
  return true
}

// console.log(buildTsType(sample))

// console.log(buildTsType(json))

// console.log(json.raw())
// console.log(raw(json))
// console.log(buildTsType(json))
