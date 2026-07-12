
const CompileResult = (js, warnings) => ({ js, warnings });

/**
 * @param {string} source
 * @returns {CompileResult}
 */
const compile = (source) => {
  let tokens = tokenize(source);
  let parsed = parse_program(tokens);
  let warnings = parsed.errors.concat(check(parsed.program));
  let js = generate(parsed.program);
  return CompileResult(js, warnings);
};

/**
 * @param {string} source
 * @returns {*}
 */
const check_source = (source) => {
  let parsed = parse_program(tokenize(source));
  return parsed.errors.concat(check(parsed.program));
};

/**
 * @param {string} source
 * @returns {FormatResult}
 */
const format = (source) => format_source(source);

