import { Type } from './type'

export class String implements Type {
  constructor(public defaultValue?: string) {}

  buildTsType() {
    return 'string'
  }

  raw() {
    return `string(${this.defaultValue ? `'${this.defaultValue}'` : ''})`
  }
}

export function string(arg?: ConstructorParameters<typeof String>[0]) {
  return new String(arg)
}
