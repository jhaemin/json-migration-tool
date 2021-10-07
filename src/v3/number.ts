import { Type } from './type'

export class Number implements Type {
  constructor(public defaultValue?: number) {}

  buildTsType() {
    return 'number'
  }

  raw() {
    return `number(${this.defaultValue ? `${this.defaultValue}` : ''})`
  }
}

export function number(arg?: ConstructorParameters<typeof Number>[0]) {
  return new Number(arg)
}
