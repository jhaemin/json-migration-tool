import { Type } from './common'

export class PrimitiveType<Literal extends string | number | boolean>
  implements Type
{
  public typeName: 'string' | 'number' | 'boolean' = 'string'

  constructor(public literal?: Literal) {}

  buildTsType() {
    return this.literal === undefined
      ? this.typeName
      : JSON.stringify(this.literal)
  }

  raw() {
    let literal = this.literal === undefined ? '' : JSON.stringify(this.literal)

    return `${this.typeName}(${literal})`
  }

  isCorrectType(value: unknown) {
    if (this.literal !== undefined) {
      return value === this.literal
    }

    return typeof value === this.typeName
  }
}
