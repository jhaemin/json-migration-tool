import { Type } from './type'

export type StringType = {
  type: 'string'
  defaultValue?: string
}

export class String implements Type {
  public defaultValue?: string
  public alias?: string

  constructor(param?: {
    defaultValue?: StringType['defaultValue']
    alias?: string
  }) {
    this.defaultValue = param?.defaultValue
    this.alias = param?.alias
  }

  buildTsType() {
    return 'string'
  }
}

export function string(param?: ConstructorParameters<typeof String>[0]) {
  return new String(param)
}
