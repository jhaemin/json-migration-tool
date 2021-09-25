// Assumptions
// 1. Root is object
// 2. Every array should be the same type

export type JsonMigrationRules = JsonMigrationRule[]

export type JsonMigrationRule =
  | JsonMigrationAddRule
  | JsonMigrationRemoveRule
  | JsonMigrationMoveRule

export type JsonMigrationAddRule = {
  type: 'add'
  path: string
  defaultValue: any
}

export type JsonMigrationRemoveRule = {
  type: 'remove'
  path: string
}

export type JsonMigrationMoveRule = {
  type: 'move'
  fromPath: string
  toPath: string
}

export type JsonMigrationConvertRule = {
  type: 'convert'
  fromPath: string
  toPath: string
  /**
   * @default (data) => data
   */
  convertFunction?: (data: any) => any
}
