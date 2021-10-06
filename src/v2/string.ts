import { Type } from './type'

export type StringType = {
  type: 'string'
  defaultValue?: string
}

export class String implements Type {
  public defaultValue?: string
  public alias?: string

  constructor(arg?: {
    defaultValue?: StringType['defaultValue']
    alias?: string
  }) {
    this.defaultValue = arg?.defaultValue
    this.alias = arg?.alias
  }

  buildTsType() {
    return 'string'
  }
}

export function string(arg?: ConstructorParameters<typeof String>[0]) {
  return new String(arg)
}
