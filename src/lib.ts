export interface IBigFloat {
  coefficient: bigint;
  exponent: number;
}

export type NumericValue = string|number|IBigFloat|bigint;

const BIGINT_ZERO: bigint        = BigInt("0");
const BIGINT_ONE: bigint         = BigInt("1");
const BIGINT_TEN: bigint         = BigInt("10");
const BIGINT_TEN_MILLION: bigint = BigInt("10000000");

const ZERO: IBigFloat = Object.create(null);
ZERO.coefficient      = BIGINT_ZERO;
ZERO.exponent         = 0;
Object.freeze(ZERO);

const EPSILON: IBigFloat
  = make("0.0000000000000000000000000000000000000000000000001");
const ONE: IBigFloat = make("1");
const TWO: IBigFloat = make("2");

export let PRECISION = -5;

export function set_precision(n: number) {
  n = Number(n);
  if (! Number.isInteger(n) || Number(n) >= 0) {
    throw Error("Only negative integers are allowed for precision.");
  }
  PRECISION = n;
}

export function is_big_float(big: NumericValue): boolean {
  return (typeof big === "object" && typeof big.coefficient === "bigint"
          && Number.isSafeInteger(big.exponent));
}

export function is_number(token: string): boolean {
  return ! Number.isNaN(Number(token));
}

export function is_negative(big: IBigFloat): boolean {
  return big.coefficient < BIGINT_ZERO;
}

export function is_positive(big: IBigFloat): boolean {
  return big.coefficient > BIGINT_ZERO;
}

export function is_zero(big: IBigFloat): boolean {
  return big.coefficient === BIGINT_ZERO;
}

export function is_integer(a: IBigFloat): boolean { return eq(a, integer(a)); }

export function eq(comparahend: IBigFloat, comparator: IBigFloat): boolean {
  return comparahend === comparator || is_zero(sub(comparahend, comparator));
}

export function lt(comparahend: IBigFloat, comparator: IBigFloat): boolean {
  return is_negative(sub(comparahend, comparator));
}

export function lte(comparahend: IBigFloat, comparator: IBigFloat): boolean {
  return lt(comparahend, comparator) || eq(comparahend, comparator);
}

export function gt(comparahend: IBigFloat, comparator: IBigFloat): boolean {
  return lt(comparator, comparahend);
}

export function gte(comparahend: IBigFloat, comparator: IBigFloat): boolean {
  return gt(comparahend, comparator) || eq(comparahend, comparator);
}

export function make_big_float(coefficient: bigint,
                               exponent: number): IBigFloat {
  if (coefficient === BIGINT_ZERO) { return ZERO; }
  const new_big_float: IBigFloat = Object.create(null);
  new_big_float.coefficient      = coefficient;
  new_big_float.exponent         = exponent;
  return Object.freeze(new_big_float);
}

export function number(a: NumericValue): number {
  if (typeof a !== "number" && typeof a !== "string") {
    if (typeof a === "bigint") {
      return Number(a);
    } else if (is_big_float(a)) {
      return a.exponent === 0 ? Number(a.coefficient)
                              : Number(a.coefficient) * 10 ** a.exponent;
    }
  }
  return Number(a);
}

export function normalize(a: IBigFloat): IBigFloat {
  let { coefficient, exponent } = a;

  // If the exponent is zero, it is already normal.
  if (exponent !== 0) {
    if (exponent > 0) {
      coefficient = coefficient * BIGINT_TEN ** BigInt(exponent);
      exponent    = 0;
    } else {
      let quotient;
      let remainder;

      // tslint:disable-next-line: no-bitwise
      while (exponent <= -7) {
        quotient  = coefficient / BIGINT_TEN_MILLION;
        remainder = coefficient % BIGINT_TEN_MILLION;
        if (remainder !== BIGINT_ZERO) { break; }
        coefficient = quotient;
        exponent += 7;
      }
      while (exponent < 0) {
        quotient  = coefficient / BIGINT_TEN;
        remainder = coefficient % BIGINT_TEN;
        if (remainder !== BIGINT_ZERO) { break; }
        coefficient = quotient;
        exponent += 1;
      }
    }
  }
  return make_big_float(coefficient, exponent);
}

export function integer(a: IBigFloat): IBigFloat {
  // The integer function is like the normalize function except that it throws
  // away significance. It discards the digits after the decimal point.

  const { coefficient, exponent } = a;

  // If the exponent is zero, it is already an integer.

  if (exponent === 0) { return a; }

  // If the exponent is positive,
  // multiply the coefficient by 10 ** exponent.

  if (exponent > 0) {
    return make_big_float(coefficient * BIGINT_TEN ** BigInt(exponent), 0);
  }

  // If the exponent is negative, divide the coefficient by 10 ** -exponent.
  // This truncates the unnecessary bits. This might be a zero result.

  return make_big_float(coefficient / BIGINT_TEN ** BigInt(-exponent), 0);
}

export function fraction(a: IBigFloat): IBigFloat { return sub(a, integer(a)); }

export function make(a: NumericValue, b?: number|string): IBigFloat {
  const number_pattern = /^(-?\d+)(?:\.(\d*))?(?:(e|E)(-?\d+))?$/;

  // . Capturing groups
  // .      [1] int
  // .      [2] frac
  // .      [3] e
  // .      [4] exp
  if (typeof a === "bigint") {
    return make_big_float(a, Number(b) || 0);
  } else if (typeof a === "string" || typeof a === "number") {
    a = String(a).replace("+", "");
    if (Number.isSafeInteger(Number(b))) {
      return make(BigInt(parseInt(a, Number(b))), 0);
    }
    const parts = a.match(number_pattern);
    if (parts) {
      const frac = parts[2] || "";
      return make(BigInt(parts[1] + frac),
                  (Number(parts[4]) || 0) - frac.length);
    }
  } else if (is_big_float(a)) {
    return a;
  }
  return ZERO;
}

export function string(a: IBigFloat, radix?: IBigFloat): string {
  if (is_zero(a)) { return "0"; }
  if (radix && is_big_float(radix)) {
    radix = normalize(radix);
    return radix && radix.exponent === 0
             ? integer(a).coefficient.toString(Number(radix.coefficient))
             : "undefined";
  }
  a     = normalize(a);
  let s = (is_negative(a) ? -a.coefficient : a.coefficient).toString();
  if (a.exponent < 0) {
    let point = s.length + a.exponent;
    if (point <= 0) {
      s     = "0".repeat(1 - point) + s;
      point = 1;
    }
    s = s.slice(0, point) + "." + s.slice(point);
  } else if (a.exponent > 0) {
    s += "0".repeat(a.exponent);
  }
  if (is_negative(a)) { s = "-" + s; }
  return s;
}

export function scientific(a: IBigFloat): string {
  if (is_zero(a)) { return "0"; }
  a = normalize(a);

  let   s = String(is_negative(a) ? -a.coefficient : a.coefficient);
  const e = a.exponent + s.length - 1;
  if (s.length > 1) {
    const decimals = [...s.slice(1)];
    for (const d of decimals.toReversed()) {
      if (d !== "0") { break; }
      decimals.pop();
    }
    s = s.slice(0, 1);
    "." + decimals.join("");
  }

  if (e !== 0) { s += "e" + e; }
  if (is_negative(a)) { s = "-" + s; }
  return s;
}

export function neg(a: IBigFloat): IBigFloat {
  return make_big_float(-a.coefficient, a.exponent);
}

export function abs(a: IBigFloat): IBigFloat {
  return is_negative(a) ? neg(a) : a;
}

function conform_op(op: (a: bigint, b: bigint) => bigint):
  (a: IBigFloat, b: IBigFloat) => IBigFloat {
  return function(a: IBigFloat, b: IBigFloat) {
    const differential = a.exponent - b.exponent;
    return differential === 0
             ? make_big_float(op(a.coefficient, b.coefficient), a.exponent)
           : differential > 0
             ? make_big_float(op(a.coefficient * BIGINT_TEN
                                   ** BigInt(differential),
                                 b.coefficient),
                              b.exponent)
             : make_big_float(op(a.coefficient, b.coefficient * BIGINT_TEN
                                                  ** BigInt(-differential)),
                              a.exponent);
  };
}

export const add: (a: IBigFloat, b: IBigFloat) => IBigFloat
  = conform_op((a: bigint, b: bigint) => a + b);
export const sub: (a: IBigFloat, b: IBigFloat) => IBigFloat
  = conform_op((a: bigint, b: bigint) => a - b);

export function mul(multiplicand: IBigFloat, multiplier: IBigFloat): IBigFloat {
  return make_big_float(multiplicand.coefficient * multiplier.coefficient,
                        multiplicand.exponent + multiplier.exponent);
}

export function div(dividend: IBigFloat, divisor: IBigFloat,
                    precision = PRECISION): IBigFloat {
  if (is_zero(divisor)) { throw RangeError("Division by zero"); }
  if (is_zero(dividend)) { return ZERO; }

  let { coefficient, exponent } = dividend;
  exponent -= divisor.exponent;

  if (typeof precision !== "number") { precision = number(precision); }

  if (exponent > precision) {
    coefficient = coefficient * BIGINT_TEN ** BigInt(exponent - precision);
    exponent    = precision;
  }

  coefficient = coefficient / divisor.coefficient;
  return make_big_float(coefficient, exponent);
}

export function sqrt(n: IBigFloat): IBigFloat {
  let x = n;
  let y = ONE;
  while (gt(sub(x, y), EPSILON)) {
    x = div(add(x, y), TWO);
    y = div(n, x);
  }
  return x;
}

export function exponentiation(base: IBigFloat, exp: IBigFloat): IBigFloat {
  if (eq(exp, ZERO)) { return ONE; }

  if (is_negative(exp)) { return div(ONE, exponentiation(base, abs(exp))); }

  if (exp.exponent === 0) {
    let result = base;
    let n      = 1;
    while (n !== number(exp)) {
      result = mul(result, base);
      n += 1;
    }
    return result;
  }
  if (gt(exp, ONE) || eq(exp, ONE)) {
    const temp = exponentiation(base, div(exp, TWO));
    return mul(temp, temp);
  }
  let low  = ZERO;
  let high = ONE;

  let sqr = sqrt(base);
  let acc = sqr;
  let mid = div(high, TWO);

  while (gt(abs(sub(mid, exp)), EPSILON)) {
    sqr = sqrt(sqr);

    if (lt(mid, exp) || eq(mid, exp)) {
      low = mid;
      acc = mul(acc, sqr);
    } else {
      high = mid;
      acc  = mul(acc, div(ONE, sqr));
    }
    mid = div(add(low, high), TWO);
  }
  return acc;
}

export function ceil(n: IBigFloat): IBigFloat {
  if (is_integer(n)) {
    return n;
  } else {
    return make_big_float(integer(n).coefficient + BIGINT_ONE, 0);
  }
}

export function floor(n: IBigFloat): IBigFloat { return integer(n); }

export function modulo(a: IBigFloat, b: IBigFloat): IBigFloat {
  return make_big_float(integer(a).coefficient % integer(b).coefficient, 0);
}
