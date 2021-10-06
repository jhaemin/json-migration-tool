import { Type } from './type'

export class String implements Type {
  public defaultValue?: string

  constructor(arg?: { defaultValue?: string }) {
    this.defaultValue = arg?.defaultValue
  }

  buildTsType() {
    return 'string'
  }
}

export function string(arg?: ConstructorParameters<typeof String>[0]) {
  return new String(arg)
}
