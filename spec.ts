import ts, { Identifier } from 'typescript'
import fs from 'fs'
import { number, string } from 'src/v3/types'

const node = ts.createSourceFile(
  'x.ts',
  fs.readFileSync('./test.ts', 'utf8'),
  ts.ScriptTarget.Latest
)

// console.log(JSON.stringify(node, null, 2))

// NumericLiteral = 8,
// StringLiteral = 10,
// Identifier = 79,
// ExportKeyword = 93, -> export
// NumberKeyword = 145, -> number
// StringKeyword = 148, -> string
// PropertySignature = 164,
// TypeLiteral = 180,
// ArrayType = 181,
// UnionType = 185,
// ParenthesizedType = 189,
// TypeAliasDeclaration = 257,

type StringType = {
  kind: 'string'
}

const aliases: Record<string, unknown> = {}

node.forEachChild((child) => {
  // Type Alias
  // ex)
  // type A = string
  // type B = { hello: string; world: number }
  if (ts.isTypeAliasDeclaration(child)) {
    const typeAliasName = child.name.escapedText as string

    aliases[typeAliasName] = typeNodeToJRS(child.type)

    // console.log(JSON.stringify(child, null, 2))
  }
})

console.log(aliases)

function typeNodeToJRS(node?: ts.Node): any {
  if (!node) {
    return 'nothing'
  }

  if (node.kind === ts.SyntaxKind.StringKeyword) {
    return 'string'
  }

  if (node.kind === ts.SyntaxKind.NumberKeyword) {
    return 'number'
  }

  // { foo: SomeType; bar: SomeType }
  if (ts.isTypeLiteralNode(node)) {
    const obj: Record<string, unknown> = {}

    node.members.forEach((member) => {
      if (ts.isPropertySignature(member)) {
        if (ts.isIdentifier(member.name)) {
          obj[member.name.escapedText as string] = typeNodeToJRS(member.type)
        }
      }
    })

    return obj
  }

  // SomeType1 | SomeType2
  if (ts.isUnionTypeNode(node)) {
    return node.types.map((type) => typeNodeToJRS(type)).join(' | ')
  }

  // SomeType[]
  if (ts.isArrayTypeNode(node)) {
    return `Array<${typeNodeToJRS(node.elementType)}>`
  }

  // Array<SomeType>
  if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) {
    if (node.typeName.escapedText === 'Array') {
      if (node.typeArguments) {
        return `Array<${JSON.stringify(typeNodeToJRS(node.typeArguments[0]))}>`
      }
    }

    // console.log(JSON.stringify(node.typeArguments, null, 2))
  }

  if (ts.isParenthesizedTypeNode(node)) {
    return `(${typeNodeToJRS(node.type)})`
  }

  if (ts.isTypeReferenceNode(node)) {
    if (ts.isIdentifier(node.typeName)) {
      return aliases[node.typeName.escapedText as string]
    }
  }

  if (ts.isLiteralTypeNode(node)) {
    if (ts.isStringLiteral(node.literal)) {
      return node.literal.text
    }

    if (ts.isNumericLiteral(node.literal)) {
      return Number(node.literal.text)
    }
  }

  console.log(node)

  return 'default'
}
