import fs from 'fs'
import ts from 'typescript'
import { buildTsType } from '.'
import {
  array,
  number,
  object,
  ObjectType,
  Property,
  property,
  record,
  string,
  tuple,
  Type,
  union,
} from './types'

const node = ts.createSourceFile(
  'x.ts',
  fs.readFileSync('./src/v3/test.ts', 'utf8'),
  ts.ScriptTarget.Latest
)

// NumericLiteral = 8,
// StringLiteral = 10,
// Identifier = 79,
// ExportKeyword = 93, -> export
// NumberKeyword = 145, -> number
// StringKeyword = 148, -> string
// PropertySignature = 164,
// TypeReference = 176,
// TypeLiteral = 180,
// ArrayType = 181,
// TupleType = 182,
// UnionType = 185,
// ParenthesizedType = 189,
// TypeAliasDeclaration = 257,

const aliases: Record<string, Type> = {}

node.forEachChild((child) => {
  // Type Alias
  // ex)
  // type A = string
  // type B = { hello: string; world: number }
  if (ts.isTypeAliasDeclaration(child)) {
    const typeAliasName = child.name.escapedText as string

    aliases[typeAliasName] = typeNodeToJRS(child.type, typeAliasName)
  }
})

console.log(aliases)

const tsType = buildTsType(aliases['Root'] as ObjectType)

console.log(tsType)

function typeNodeToJRS(node: ts.Node, alias?: string): Type | never {
  console.log(alias)

  if (node.kind === ts.SyntaxKind.StringKeyword) {
    return string()
  }

  if (node.kind === ts.SyntaxKind.NumberKeyword) {
    return number()
  }

  // { foo: SomeType; bar: SomeType }
  if (ts.isTypeLiteralNode(node)) {
    const properties = node.members.map((member) => {
      if (ts.isPropertySignature(member)) {
        if (ts.isIdentifier(member.name)) {
          if (!member.type) {
            throw Error(
              `Member's type doesn't exist. Member type: ${member.type}`
            )
          }

          let defaultValue: string | number | undefined = undefined

          if ('jsDoc' in member) {
            ;(member as any).jsDoc.forEach((jsDoc: ts.JSDoc) => {
              jsDoc.tags?.forEach((tag) => {
                if (tag.tagName.escapedText === 'default') {
                  if (Number(tag.comment).toString() === tag.comment) {
                    defaultValue = Number(tag.comment)
                  } else if (typeof tag.comment === 'string') {
                    defaultValue = tag.comment
                  } else {
                    throw Error(
                      `Unsupported tag comment. Tag comment: ${tag.comment}`
                    )
                  }
                }
              })
            })
          }

          return property(
            member.name.escapedText as string,
            typeNodeToJRS(member.type),
            { optional: member.questionToken ? true : false, defaultValue }
          )
        }

        throw Error(
          `Member's name of a property signature is not an identifier. Member kind: ${member.kind}`
        )
      }

      throw Error(
        `Member of a type literal node is not property signature. Member kind: ${member.kind}`
      )
    })

    // return obj
    return object(properties as Property[], { alias })
  }

  // SomeType1 | SomeType2
  if (ts.isUnionTypeNode(node)) {
    return union(
      node.types.map((type) => typeNodeToJRS(type)),
      { alias }
    )
  }

  // SomeType[]
  if (ts.isArrayTypeNode(node)) {
    return array(typeNodeToJRS(node.elementType), { alias })
  }

  // SomeRef<SomeType>
  if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) {
    // Array<SomeType>
    if (node.typeName.escapedText === 'Array') {
      if (node.typeArguments) {
        return array(typeNodeToJRS(node.typeArguments[0]), { alias })
      }
    }
    // Record<SomeType, SomeType>
    else if (node.typeName.escapedText === 'Record') {
      if (node.typeArguments) {
        return record(typeNodeToJRS(node.typeArguments[1]), { alias })
      }
    } else if (aliases[node.typeName.escapedText as string]) {
      const aliasName = node.typeName.escapedText as string
      const alias = aliases[aliasName]

      if (alias === undefined) {
        throw Error(`Alias "${aliasName}"" doesn't exist.`)
      }

      return aliases[aliasName]
    }

    throw Error(`Unsupported type reference. Kind: ${node.kind}`)
  }

  // ( .. )
  if (ts.isParenthesizedTypeNode(node)) {
    return typeNodeToJRS(node.type)
  }

  // Literals: 'foo', 99
  if (ts.isLiteralTypeNode(node)) {
    if (ts.isStringLiteral(node.literal)) {
      return string(node.literal.text)
    }

    if (ts.isNumericLiteral(node.literal)) {
      return number(Number(node.literal.text))
    }

    throw Error(`Unsupported literal type. Kind: ${node.kind}`)
  }

  // [SomeType1, SomeType2]
  if (ts.isTupleTypeNode(node)) {
    return tuple(
      node.elements.map((element) => typeNodeToJRS(element)),
      { alias }
    )
  }

  throw Error(`Unsupported kind of type. Kind: ${node.kind}`)
}
