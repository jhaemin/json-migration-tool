const { Migrator } = require('../dist/migration/migrate')
const { object, property, string, number, record } = require('../dist/jrs')
const { add, remove, change, move } = require('../dist/migration/rules')
const { buildTsType } = require('../dist')
const equal = require('fast-deep-equal')

// console.log(JSON.stringify(migratedData, null, 2))
// console.log(buildTsType(jrs))

test('Migration Test 1', () => {
  const jrs = object([
    property('version', string()),
    property(
      'blocks',
      record(
        object([
          property('id', string()),
          property(
            'styles',
            object([
              property('padding', number()),
              property('margin', number()),
            ])
          ),
        ])
      )
    ),
  ])

  /** @type {import('../dist/jrs').InferType<typeof jrs>} */
  const data = {
    version: '1.0.0',
    blocks: {
      '1C9A': {
        id: '1C9A',
        styles: {
          padding: 0,
          margin: 0,
        },
      },
    },
  }

  const migrator = new Migrator(jrs, [
    add({
      property: property('date', string()),
      at: '',
      value: 'hello',
    }),
  ])

  const { data: migratedData, jrs: migratedJrs } = migrator.migrate(data)

  expect(
    equal(migratedData, {
      ...data,
      date: 'hello',
    })
  ).toBe(true)
})
