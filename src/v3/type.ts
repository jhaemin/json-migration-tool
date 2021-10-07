export interface Type {
  alias?: string
  buildTsType(): string
  raw(): string
}
