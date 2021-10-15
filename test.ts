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
    blocks: Record<string, Style>
  }
  strs: Record<string, string | number>
  tuples: [string, number]
}

// export type Arr = (string | number)[]

// export type Meta = {
//   block: Record<string, Block>
// }
