/** @param {string} v @returns {boolean} */
const __validate_HeroName = (v) => v.length > 0;
/** @param {string} v @returns {boolean} */
const __validate_ClassName = (v) => v.length > 0;
/** @param {number} v @returns {boolean} */
const __validate_Gold = (v) => v >= 0;
/** @param {number} v @returns {boolean} */
const __validate_XP = (v) => v >= 0;

/**
 * @param {HeroName} name
 * @param {ClassName} klass
 * @returns {string}
 */
const greet = (name, klass) => {
  if (!__validate_HeroName(name)) throw new Error("SynthConstraintError: name violates HeroName constraint (got " + JSON.stringify(name) + ")");
  if (!__validate_ClassName(klass)) throw new Error("SynthConstraintError: klass violates ClassName constraint (got " + JSON.stringify(klass) + ")");
  return name + " the " + klass;
};

/**
 * @param {Gold} g
 * @param {XP} x
 * @returns {number}
 */
const purse = (g, x) => {
  if (!__validate_Gold(g)) throw new Error("SynthConstraintError: g violates Gold constraint (got " + JSON.stringify(g) + ")");
  if (!__validate_XP(x)) throw new Error("SynthConstraintError: x violates XP constraint (got " + JSON.stringify(x) + ")");
  return g + x;
};

__synth_tests.push({ desc: "validators accept non-empty names", fn: () => greet("Ada", "Mage") == "Ada the Mage" });

__synth_tests.push({ desc: "gold and xp share constraint shape", fn: () => purse(3, 7) == 10 });

