import { Type } from './type'

export class Number implements Type {
  public defaultValue?: number

  constructor(arg?: { defaultValue?: number }) {
    this.defaultValue = arg?.defaultValue
  }

  buildTsType() {
    return 'number'
  }
}

export function number(arg?: ConstructorParameters<typeof Number>[0]) {
  return new Number(arg)
}
