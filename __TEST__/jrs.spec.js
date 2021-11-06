const {
  number,
  string,
  boolean,
  nil,
  object,
  property,
  record,
  union,
} = require('../dist/jrs')

test('JRS::NumberType::isCorrectType', () => {
  expect(number().isCorrectType(-1)).toBe(true)
  expect(number().isCorrectType(0)).toBe(true)
  expect(number().isCorrectType(1)).toBe(true)

  expect(number().isCorrectType(true)).toBe(false)
  expect(number().isCorrectType({})).toBe(false)
  expect(number().isCorrectType(null)).toBe(false)
  expect(number().isCorrectType(undefined)).toBe(false)

  expect(number().isCorrectType(1.2)).toBe(true)
  expect(number().isCorrectType(3.141592)).toBe(true)
  expect(number().isCorrectType(BigInt(100000000000000000))).toBe(false)

  expect(number().isCorrectType('-1')).toBe(false)
  expect(number().isCorrectType('0')).toBe(false)
  expect(number().isCorrectType('1')).toBe(false)

  expect(number(-1).isCorrectType(-1)).toBe(true)
  expect(number(0).isCorrectType(0)).toBe(true)
  expect(number(1).isCorrectType(1)).toBe(true)

  expect(number(-1).isCorrectType(1)).toBe(false)
  expect(number(0).isCorrectType(1)).toBe(false)
  expect(number(1).isCorrectType(-1)).toBe(false)

  expect(number(-1).isCorrectType('-1')).toBe(false)
  expect(number(0).isCorrectType('0')).toBe(false)
  expect(number(1).isCorrectType('1')).toBe(false)
})

test('JRS::StringType::isCorrectType', () => {
  expect(string().isCorrectType('Hello World')).toBe(true)
  expect(string().isCorrectType(1)).toBe(false)
  expect(string().isCorrectType(true)).toBe(false)
  expect(string().isCorrectType({})).toBe(false)
  expect(string().isCorrectType(null)).toBe(false)
  expect(string().isCorrectType(undefined)).toBe(false)

  expect(string('Hello World').isCorrectType('Hello World')).toBe(true)
  expect(string('Hello World').isCorrectType('Goodbye World')).toBe(false)
  expect(string('Home').isCorrectType(3)).toBe(false)
})

test('JRS::BooleanType::isCorrectType', () => {
  expect(boolean().isCorrectType(true)).toBe(true)
  expect(boolean().isCorrectType(false)).toBe(true)
  expect(boolean().isCorrectType('true')).toBe(false)
  expect(boolean().isCorrectType('false')).toBe(false)
  expect(boolean().isCorrectType(1)).toBe(false)
  expect(boolean().isCorrectType(null)).toBe(false)
  expect(boolean().isCorrectType({})).toBe(false)
  expect(boolean().isCorrectType(undefined)).toBe(false)
})

test('JRS::NullType::isCorrectType', () => {
  expect(nil().isCorrectType(null)).toBe(true)
  expect(nil().isCorrectType('null')).toBe(false)
  expect(nil().isCorrectType(undefined)).toBe(false)
  expect(nil().isCorrectType(1)).toBe(false)
  expect(nil().isCorrectType({})).toBe(false)
})

test('JRS::ObjectType::isCorrectType', () => {
  expect(
    object([property('foo', string())]).isCorrectType({ foo: 'Hello World' })
  ).toBe(true)

  expect(
    object([
      property('foo', string()),
      property('bar', number()),
    ]).isCorrectType({ foo: 'Hello World', bar: 3 })
  ).toBe(true)

  expect(
    object([
      property('foo', string()),
      property('bar', number()),
    ]).isCorrectType({ foo: 'Hello World' })
  ).toBe(false)

  expect(
    object([
      property('foo', string()),
      property('bar', number()),
    ]).isCorrectType({ foo: 'Hello World', bar: '3' })
  ).toBe(false)

  // Test unsoundness
  expect(
    object([
      property('foo', string()),
      property('bar', number()),
    ]).isCorrectType({ foo: 'Hello World', bar: 3, more: 10 })
  ).toBe(true)

  expect(
    object([
      property('foo', string()),
      property('bar', number()),
    ]).isCorrectType({})
  ).toBe(false)
})

test('JRS::RecordType::isCorrectType', () => {
  expect(record(string()).isCorrectType()).toBe(false)
  expect(record(string()).isCorrectType([])).toBe(false)
  expect(record(string()).isCorrectType(null)).toBe(false)
  expect(record(string()).isCorrectType(undefined)).toBe(false)
  expect(record(string()).isCorrectType(10)).toBe(false)
  expect(record(string()).isCorrectType('Hello World')).toBe(false)

  expect(
    record(string()).isCorrectType({
      1: 'what',
    })
  ).toBe(true)

  expect(
    record(string()).isCorrectType({
      1: 'what',
      2: 'foo',
      3: 'bar',
    })
  ).toBe(true)

  expect(
    record(string()).isCorrectType({
      1: 10,
    })
  ).toBe(false)
})

test('JRS::UnionType::isCorrectType', () => {
  expect(union([string(), number()]).isCorrectType(1)).toBe(true)
  expect(union([string(), number()]).isCorrectType('1')).toBe(true)
  expect(union([string(), number()]).isCorrectType({})).toBe(false)
  expect(union([string(), number()]).isCorrectType([])).toBe(false)
  expect(union([string(), number()]).isCorrectType(null)).toBe(false)
  expect(union([string(), number()]).isCorrectType(true)).toBe(false)
})
