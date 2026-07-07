/** @typedef {{
 *   kind: string,
 *   body: *
 * }} Program
 */
const Program = (kind, body) => ({ kind, body });

/** @typedef {{
 *   kind: string,
 *   name: string,
 *   typeParams: *,
 *   type: *,
 *   constraint: *,
 *   line: number
 * }} TypeAlias
 */
const TypeAlias = (kind, name, typeParams, type, constraint, line) => ({ kind, name, typeParams, type, constraint, line });

/** @typedef {{
 *   kind: string,
 *   name: string,
 *   typeParams: *,
 *   fields: *,
 *   line: number
 * }} InterfaceDecl
 */
const InterfaceDecl = (kind, name, typeParams, fields, line) => ({ kind, name, typeParams, fields, line });

/** @typedef {{
 *   name: string,
 *   type: *
 * }} InterfaceField
 */
const InterfaceField = (name, type) => ({ name, type });

/** @typedef {{
 *   kind: string,
 *   name: string,
 *   variants: *,
 *   line: number
 * }} EnumDecl
 */
const EnumDecl = (kind, name, variants, line) => ({ kind, name, variants, line });

/** @typedef {{
 *   kind: string,
 *   name: string,
 *   variants: *,
 *   line: number
 * }} TaggedUnionDecl
 */
const TaggedUnionDecl = (kind, name, variants, line) => ({ kind, name, variants, line });

/** @typedef {{
 *   name: string,
 *   fields: *
 * }} UnionVariant
 */
const UnionVariant = (name, fields) => ({ name, fields });

/** @typedef {{
 *   kind: string,
 *   description: string,
 *   body: *,
 *   line: number
 * }} TestDecl
 */
const TestDecl = (kind, description, body, line) => ({ kind, description, body, line });

/** @typedef {{
 *   kind: string,
 *   names: *,
 *   source: string,
 *   line: number
 * }} ImportDecl
 */
const ImportDecl = (kind, names, source, line) => ({ kind, names, source, line });

/** @typedef {{
 *   kind: string,
 *   decl: *,
 *   line: number
 * }} ExportDecl
 */
const ExportDecl = (kind, decl, line) => ({ kind, decl, line });

/** @typedef {{
 *   kind: string,
 *   expr: *,
 *   line: number
 * }} TopLevelExpr
 */
const TopLevelExpr = (kind, expr, line) => ({ kind, expr, line });

/** @typedef {{
 *   kind: string,
 *   name: *,
 *   value: *,
 *   line: number
 * }} TopLevelLet
 */
const TopLevelLet = (kind, name, value, line) => ({ kind, name, value, line });

/** @typedef {{
 *   kind: string,
 *   stmt: *,
 *   line: number
 * }} TopLevelStmt
 */
const TopLevelStmt = (kind, stmt, line) => ({ kind, stmt, line });

/** @typedef {{
 *   kind: string,
 *   name: string,
 *   typeParams: *,
 *   fields: *,
 *   line: number
 * }} RecordDecl
 */
const RecordDecl = (kind, name, typeParams, fields, line) => ({ kind, name, typeParams, fields, line });

/** @typedef {{
 *   name: string,
 *   type: *
 * }} FieldDecl
 */
const FieldDecl = (name, type) => ({ name, type });

/** @typedef {{
 *   kind: string,
 *   name: string,
 *   typeParams: *,
 *   params: *,
 *   returnType: *,
 *   annotations: *,
 *   body: *,
 *   shortForm: boolean,
 *   isAsync: boolean,
 *   line: number
 * }} FnDecl
 */
const FnDecl = (kind, name, typeParams, params, returnType, annotations, body, shortForm, isAsync, line) => ({ kind, name, typeParams, params, returnType, annotations, body, shortForm, isAsync, line });

/** @typedef {{
 *   kind: string,
 *   name: string,
 *   fields: *,
 *   line: number
 * }} StoreDecl
 */
const StoreDecl = (kind, name, fields, line) => ({ kind, name, fields, line });

/** @typedef {{
 *   name: string,
 *   type: *,
 *   defaultValue: *
 * }} StoreField
 */
const StoreField = (name, type, defaultValue) => ({ name, type, defaultValue });

/** @typedef {{
 *   kind: string,
 *   name: string,
 *   annotations: *,
 *   body: *,
 *   line: number
 * }} ModuleDecl
 */
const ModuleDecl = (kind, name, annotations, body, line) => ({ kind, name, annotations, body, line });

/** @typedef {{
 *   name: string,
 *   value: *
 * }} Annotation
 */
const Annotation = (name, value) => ({ name, value });

/** @typedef {{
 *   name: string,
 *   type: *,
 *   spread: boolean
 * }} FnParam
 */
const FnParam = (name, type, spread) => ({ name, type, spread });

/** @typedef {{
 *   kind: string,
 *   op: string,
 *   value: *
 * }} CompareConstraint
 */
const CompareConstraint = (kind, op, value) => ({ kind, op, value });

/** @typedef {{
 *   kind: string,
 *   op: string,
 *   value: number
 * }} LengthConstraint
 */
const LengthConstraint = (kind, op, value) => ({ kind, op, value });

/** @typedef {{
 *   kind: string,
 *   preset: string
 * }} MatchesConstraint
 */
const MatchesConstraint = (kind, preset) => ({ kind, preset });

/** @typedef {{
 *   kind: string,
 *   pattern: string,
 *   flags: string
 * }} RegexConstraint
 */
const RegexConstraint = (kind, pattern, flags) => ({ kind, pattern, flags });

/** @typedef {{
 *   kind: string,
 *   left: *,
 *   right: *
 * }} AndConstraint
 */
const AndConstraint = (kind, left, right) => ({ kind, left, right });

/** @typedef {{
 *   kind: string,
 *   left: *,
 *   right: *
 * }} OrConstraint
 */
const OrConstraint = (kind, left, right) => ({ kind, left, right });

/** @typedef {{
 *   kind: string,
 *   inner: *
 * }} NotConstraint
 */
const NotConstraint = (kind, inner) => ({ kind, inner });

/** @typedef {{
 *   kind: string,
 *   expr: *
 * }} CustomConstraint
 */
const CustomConstraint = (kind, expr) => ({ kind, expr });

/** @typedef {{
 *   name: string,
 *   typeArgs: *,
 *   isArray: boolean,
 *   isOptional: boolean,
 *   union: *,
 *   fnParams: *,
 *   fnReturn: *
 * }} TypeExpr
 */
const TypeExpr = (name, typeArgs, isArray, isOptional, union, fnParams, fnReturn) => ({ name, typeArgs, isArray, isOptional, union, fnParams, fnReturn });

/** @typedef {{
 *   kind: string,
 *   value: number,
 *   raw: string
 * }} NumberLit
 */
const NumberLit = (kind, value, raw) => ({ kind, value, raw });

/** @typedef {{
 *   kind: string,
 *   value: string,
 *   raw: string
 * }} StringLit
 */
const StringLit = (kind, value, raw) => ({ kind, value, raw });

/** @typedef {{
 *   kind: string,
 *   raw: string,
 *   quasis: *,
 *   exprs: *
 * }} TemplateLit
 */
const TemplateLit = (kind, raw, quasis, exprs) => ({ kind, raw, quasis, exprs });

/** @typedef {{
 *   kind: string,
 *   value: boolean
 * }} BoolLit
 */
const BoolLit = (kind, value) => ({ kind, value });

/** @typedef {{
 *   kind: string,
 *   pattern: string,
 *   flags: string
 * }} RegexLit
 */
const RegexLit = (kind, pattern, flags) => ({ kind, pattern, flags });

/** @typedef {{
 *   kind: string
 * }} NullLit
 */
const NullLit = (kind) => ({ kind });

/** @typedef {{
 *   kind: string,
 *   code: string
 * }} RawJS
 */
const RawJS = (kind, code) => ({ kind, code });

/** @typedef {{
 *   kind: string,
 *   name: string
 * }} Identifier
 */
const Identifier = (kind, name) => ({ kind, name });

/** @typedef {{
 *   kind: string,
 *   properties: *
 * }} ObjectLit
 */
const ObjectLit = (kind, properties) => ({ kind, properties });

/** @typedef {{
 *   kind: string,
 *   key: *,
 *   value: *,
 *   computed: boolean,
 *   shorthand: boolean,
 *   spread: boolean
 * }} ObjectProperty
 */
const ObjectProperty = (kind, key, value, computed, shorthand, spread) => ({ kind, key, value, computed, shorthand, spread });

/** @typedef {{
 *   kind: string,
 *   elements: *
 * }} ArrayLit
 */
const ArrayLit = (kind, elements) => ({ kind, elements });

/** @typedef {{
 *   kind: string,
 *   argument: *
 * }} SpreadExpr
 */
const SpreadExpr = (kind, argument) => ({ kind, argument });

/** @typedef {{
 *   kind: string,
 *   op: string,
 *   left: *,
 *   right: *
 * }} BinaryExpr
 */
const BinaryExpr = (kind, op, left, right) => ({ kind, op, left, right });

/** @typedef {{
 *   kind: string,
 *   op: string,
 *   operand: *,
 *   prefix: boolean
 * }} UnaryExpr
 */
const UnaryExpr = (kind, op, operand, prefix) => ({ kind, op, operand, prefix });

/** @typedef {{
 *   kind: string,
 *   test: *,
 *   consequent: *,
 *   alternate: *
 * }} TernaryExpr
 */
const TernaryExpr = (kind, test, consequent, alternate) => ({ kind, test, consequent, alternate });

/** @typedef {{
 *   kind: string,
 *   callee: *,
 *   args: *,
 *   optional: boolean
 * }} CallExpr
 */
const CallExpr = (kind, callee, args, optional) => ({ kind, callee, args, optional });

/** @typedef {{
 *   kind: string,
 *   callee: *,
 *   args: *
 * }} NewExpr
 */
const NewExpr = (kind, callee, args) => ({ kind, callee, args });

/** @typedef {{
 *   kind: string,
 *   object: *,
 *   index: *,
 *   optional: boolean
 * }} IndexExpr
 */
const IndexExpr = (kind, object, index, optional) => ({ kind, object, index, optional });

/** @typedef {{
 *   kind: string,
 *   object: *,
 *   property: string,
 *   optional: boolean
 * }} MemberExpr
 */
const MemberExpr = (kind, object, property, optional) => ({ kind, object, property, optional });

/** @typedef {{
 *   kind: string,
 *   params: *,
 *   body: *,
 *   isAsync: boolean
 * }} LambdaExpr
 */
const LambdaExpr = (kind, params, body, isAsync) => ({ kind, params, body, isAsync });

/** @typedef {{
 *   kind: string,
 *   name: string
 * }} PipeAsStep
 */
const PipeAsStep = (kind, name) => ({ kind, name });

/** @typedef {{
 *   kind: string,
 *   steps: *
 * }} PipelineExpr
 */
const PipelineExpr = (kind, steps) => ({ kind, steps });

/** @typedef {{
 *   kind: string,
 *   stmts: *
 * }} BlockExpr
 */
const BlockExpr = (kind, stmts) => ({ kind, stmts });

/** @typedef {{
 *   kind: string,
 *   body: *
 * }} DoExpr
 */
const DoExpr = (kind, body) => ({ kind, body });

/** @typedef {{
 *   kind: string,
 *   value: *
 * }} ResultPropagateExpr
 */
const ResultPropagateExpr = (kind, value) => ({ kind, value });

/** @typedef {{
 *   kind: string,
 *   value: *
 * }} AwaitExpr
 */
const AwaitExpr = (kind, value) => ({ kind, value });

/** @typedef {{
 *   kind: string,
 *   subject: *,
 *   arms: *
 * }} MatchExpr
 */
const MatchExpr = (kind, subject, arms) => ({ kind, subject, arms });

/** @typedef {{
 *   pattern: *,
 *   guard: *,
 *   body: *
 * }} MatchArm
 */
const MatchArm = (pattern, guard, body) => ({ pattern, guard, body });

/** @typedef {{
 *   kind: string,
 *   name: *,
 *   value: *,
 *   mutable: boolean,
 *   infer: boolean
 * }} LetStmt
 */
const LetStmt = (kind, name, value, mutable, infer) => ({ kind, name, value, mutable, infer });

/** @typedef {{
 *   kind: string,
 *   style: string,
 *   names: *,
 *   value: *
 * }} DestructureStmt
 */
const DestructureStmt = (kind, style, names, value) => ({ kind, style, names, value });

/** @typedef {{
 *   kind: string,
 *   value: *
 * }} ReturnStmt
 */
const ReturnStmt = (kind, value) => ({ kind, value });

/** @typedef {{
 *   kind: string,
 *   value: *
 * }} ExprStmt
 */
const ExprStmt = (kind, value) => ({ kind, value });

/** @typedef {{
 *   kind: string,
 *   test: *,
 *   then: *,
 *   else_: *
 * }} IfStmt
 */
const IfStmt = (kind, test, then, else_) => ({ kind, test, then, else_ });

/** @typedef {{
 *   kind: string,
 *   varName: string,
 *   lo: *,
 *   hi: *,
 *   inclusive: boolean,
 *   body: *
 * }} ForRangeStmt
 */
const ForRangeStmt = (kind, varName, lo, hi, inclusive, body) => ({ kind, varName, lo, hi, inclusive, body });

/** @typedef {{
 *   kind: string,
 *   varName: string,
 *   iter: *,
 *   body: *
 * }} ForInStmt
 */
const ForInStmt = (kind, varName, iter, body) => ({ kind, varName, iter, body });

/** @typedef {{
 *   kind: string,
 *   test: *,
 *   body: *
 * }} WhileStmt
 */
const WhileStmt = (kind, test, body) => ({ kind, test, body });

/** @typedef {{
 *   kind: string
 * }} BreakStmt
 */
const BreakStmt = (kind) => ({ kind });

/** @typedef {{
 *   kind: string
 * }} ContinueStmt
 */
const ContinueStmt = (kind) => ({ kind });

/** @typedef {{
 *   kind: string,
 *   name: string,
 *   claim: string
 * }} RefineStmt
 */
const RefineStmt = (kind, name, claim) => ({ kind, name, claim });

/** @typedef {{
 *   kind: string,
 *   value: *
 * }} LiteralPat
 */
const LiteralPat = (kind, value) => ({ kind, value });

/** @typedef {{
 *   kind: string
 * }} WildcardPat
 */
const WildcardPat = (kind) => ({ kind });

/** @typedef {{
 *   kind: string,
 *   op: string,
 *   value: *
 * }} ComparePat
 */
const ComparePat = (kind, op, value) => ({ kind, op, value });

/** @typedef {{
 *   kind: string,
 *   name: string
 * }} IdentPat
 */
const IdentPat = (kind, name) => ({ kind, name });

/** @typedef {{
 *   kind: string,
 *   name: string,
 *   bindings: *
 * }} TagPat
 */
const TagPat = (kind, name, bindings) => ({ kind, name, bindings });

/** @typedef {{
 *   kind: string,
 *   enumName: string,
 *   variant: string
 * }} EnumPat
 */
const EnumPat = (kind, enumName, variant) => ({ kind, enumName, variant });

/** @typedef {{
 *   severity: string,
 *   message: string,
 *   line: number,
 *   col: number
 * }} Diagnostic
 */
const Diagnostic = (severity, message, line, col) => ({ severity, message, line, col });

/**
 * @param {*} body
 * @returns {Program}
 */
const program = (body) => Program("Program", body);

/**
 * @param {string} name
 * @param {*} ty
 * @param {number} line
 * @returns {TypeAlias}
 */
const type_alias = (name, ty, line) => TypeAlias("TypeAlias", name, [], ty, null, line);

/**
 * @param {string} name
 * @param {*} params
 * @param {*} return_type
 * @param {*} body
 * @param {number} line
 * @returns {FnDecl}
 */
const fn_decl = (name, params, return_type, body, line) => FnDecl("FnDecl", name, [], params, return_type, [], body, false, false, line);

/**
 * @param {string} name
 * @param {*} fields
 * @param {number} line
 * @returns {RecordDecl}
 */
const record_decl = (name, fields, line) => RecordDecl("RecordDecl", name, [], fields, line);

/**
 * @param {number} value
 * @param {string} raw
 * @returns {NumberLit}
 */
const number_lit = (value, raw) => NumberLit("NumberLit", value, raw);

/**
 * @param {string} value
 * @param {string} raw
 * @returns {StringLit}
 */
const string_lit = (value, raw) => StringLit("StringLit", value, raw);

/**
 * @param {boolean} value
 * @returns {BoolLit}
 */
const bool_lit = (value) => BoolLit("BoolLit", value);

/**
 * @param {string} name
 * @returns {Identifier}
 */
const ident = (name) => Identifier("Identifier", name);

/**
 * @param {*} stmts
 * @returns {BlockExpr}
 */
const block_expr = (stmts) => BlockExpr("BlockExpr", stmts);

/**
 * @param {*} value
 * @returns {ExprStmt}
 */
const expr_stmt = (value) => ExprStmt("ExprStmt", value);

/**
 * @param {*} expr
 * @param {number} line
 * @returns {TopLevelExpr}
 */
const top_level_expr = (expr, line) => TopLevelExpr("TopLevelExpr", expr, line);

/**
 * @param {string} name
 * @returns {TypeExpr}
 */
const type_expr = (name) => TypeExpr(name, [], false, false, [], [], null);

/**
 * @param {string} name
 * @param {*} ty
 * @returns {FieldDecl}
 */
const field_decl = (name, ty) => FieldDecl(name, ty);

/**
 * @param {string} name
 * @param {*} ty
 * @returns {FnParam}
 */
const fn_param = (name, ty) => FnParam(name, ty, false);

/**
 * @param {*} node
 * @returns {string}
 */
const ast_kind = (node) => node.kind;

