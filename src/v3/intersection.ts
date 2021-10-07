import { Type } from './type'

export class Intersection implements Type {
  public types: Type[]
  public alias?: string

  constructor(types: Type[], options?: { alias?: string }) {
    this.types = types
    this.alias = options?.alias
  }

  buildTsType() {
    return this.types.map((type) => type.buildTsType()).join(' & ')
  }

  raw() {
    let optionsRaw = ''

    if (this.alias) {
      optionsRaw += `, {
alias: ${this.alias},`
    }

    if (optionsRaw) {
      optionsRaw += ' }'
    }

    return `intersection([${this.types.map((type) =>
      type.raw()
    )}]${optionsRaw})`
  }
}

export function intersection(
  ...arg: ConstructorParameters<typeof Intersection>
): Intersection {
  return new Intersection(...arg)
}
