# JSON Migration Tool

**JSON Migration Tool(JMT)** helps you easily manage and migrate JSON data with a type safety in both compile-time and runtime.

## JSON Runtime Schema (JRS)

JRS is a way you describe a structure of JSON in a runtime TypeScript code. Since JRS is powerfully typed, it can generate TypeScript declarations and also its original source code.

### Why JRS instead of just TS declarations?

TypeScript declarations seem currently the best way to describe a structure of JSON or even any JavaScript data.

## Type Safety

JMT never goes into any fault situations. It type-checks both compile-time and runtime. You can write migration rules and migrate with confidence.

## Supporting Types

- Boolean
- String
- Number
- Literal
- Object
- Record
- Array
- Tuple
- Union
- Null

## Define only the changes

It's hard to detect the exact changes between two schemas.

## Inference compile-time types from runtime schema
