// export type A = string

type Style = {
  padding: number
  margin: number
}

export type Block = {
  literal: 'foo'
  literal2: 0
  hello: string | number
  world: string[]
  foo: (string | number)[]
  bar: Array<string>
  styles: Style[]
  obj: {
    foo: string
  }
}

// export type Arr = (string | number)[]

// export type Meta = {
//   block: Record<string, Block>
// }
