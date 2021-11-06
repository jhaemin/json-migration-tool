// export type A = string

type Style = {
  padding: number
  margin: number
}

type Blocks = Record<string, Style>

// TODO
// optional property
// default value
export type Root = {
  // /**
  //  * Great
  //  */
  // /**
  //  * Alright
  //  * @default value
  //  */
  // optionalProperty?: 'value'
  // literal: 'foo'
  // literal2: 0
  // hello: string | number
  // world: string[]
  // foo: (string | number)[]
  // bar: Array<string>
  styles: Style[]
  obj: {
    foo: string
    blocks: Blocks
  }
  // strs: Record<string, string | number>
  // tuples: [string, number]
}

// export type Arr = (string | number)[]

// export type Meta = {
//   block: Record<string, Block>
// }
