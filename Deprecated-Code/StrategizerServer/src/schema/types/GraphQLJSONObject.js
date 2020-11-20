/* eslint-disable no-void */
exports.__esModule = true;
exports.GraphQLJSONObject = void 0;
exports.default = void 0;
exports.GraphQLJSON = void 0;

const _graphql = require('graphql');

const _language = require('graphql/language');

function identity(value) {
  return value;
}

function ensureObject(value) {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new TypeError(`JSONObject cannot represent non-object value: ${value}`);
  }

  return value;
}

function parseObject(ast, variables) {
  const value = Object.create(null);
  ast.fields.forEach((field) => {
    // eslint-disable-next-line no-use-before-define
    value[field.name.value] = parseLiteral(field.value, variables);
  });
  return value;
}

function parseLiteral(ast, variables) {
  switch (ast.kind) {
    case _language.Kind.STRING:
    case _language.Kind.BOOLEAN:
      return ast.value;

    case _language.Kind.INT:
    case _language.Kind.FLOAT:
      return parseFloat(ast.value);

    case _language.Kind.OBJECT:
      return parseObject(ast, variables);

    case _language.Kind.LIST:
      return ast.values.map(n => parseLiteral(n, variables));

    case _language.Kind.NULL:
      return null;

    case _language.Kind.VARIABLE:
    {
      const name = ast.name.value;
      return variables ? variables[name] : undefined;
    }

    default:
      return undefined;
  }
} // This named export is intended for users of CommonJS. Users of ES modules
// should instead use the default export.


const GraphQLJSON = new _graphql.GraphQLScalarType({
  name: 'JSON',
  description: 'The `JSON` scalar type represents JSON values as specified by'
  + ' [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf).',
  serialize: identity,
  parseValue: identity,
  parseLiteral,
});
exports.GraphQLJSON = GraphQLJSON;
const _default = GraphQLJSON;
exports.default = _default;
const GraphQLJSONObject = new _graphql.GraphQLScalarType({
  name: 'JSONObject',
  description: 'The `JSONObject` scalar type represents JSON objects as specified by'
  + ' [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf).',
  serialize: ensureObject,
  parseValue: ensureObject,
  parseLiteral: parseObject,
});
exports.GraphQLJSONObject = GraphQLJSONObject;
