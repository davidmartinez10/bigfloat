import JSBI from "jsbi";
import { sub } from "./arithmetic.js";
import { BIGINT_TEN, BIGINT_TEN_MILLION, BIGINT_ZERO, ZERO } from "./constants.js";
import { is_big_float, is_zero } from "./predicates.js";
import { IBigFloat, NumericValue } from "./types";

export function make_big_float(coefficient: JSBI, exponent: number): IBigFloat {
  if (JSBI.EQ(coefficient, BIGINT_ZERO)) {
    return ZERO;
  }
  const new_big_float: IBigFloat = Object.create(null);
  new_big_float.coefficient = coefficient;
  new_big_float.exponent = exponent;
  return Object.freeze(new_big_float);
}

export function number(a: NumericValue): number {
  if (typeof a !== "number" && typeof a !== "string") {
    if (a instanceof JSBI) {
      return JSBI.toNumber(a);
    } else if (is_big_float(a)) {
      return a.exponent === 0
        ? JSBI.toNumber(a.coefficient)
        : JSBI.toNumber(a.coefficient) * 10 ** a.exponent;
    }
  }
  return Number(a);
}

export function normalize(a: IBigFloat): IBigFloat {
  let { coefficient, exponent } = a;

  // If the exponent is zero, it is already normal.
  if (exponent !== 0) {
    if (exponent > 0) {
      coefficient = JSBI.multiply(
        coefficient,
        JSBI.exponentiate(BIGINT_TEN, JSBI.BigInt(exponent))
      );
      exponent = 0;
    } else {
      let quotient;
      let remainder;

      // tslint:disable-next-line: no-bitwise
      while (exponent <= -7) {
        quotient = JSBI.divide(coefficient, BIGINT_TEN_MILLION);
        remainder = JSBI.remainder(coefficient, BIGINT_TEN_MILLION);
        if (!JSBI.EQ(remainder, BIGINT_ZERO)) {
          break;
        }
        coefficient = quotient;
        exponent += 7;
      }
      while (exponent < 0) {
        quotient = JSBI.divide(coefficient, BIGINT_TEN);
        remainder = JSBI.remainder(coefficient, BIGINT_TEN);
        if (!JSBI.EQ(remainder, BIGINT_ZERO)) {
          break;
        }
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

  if (exponent === 0) {
    return a;
  }

  // If the exponent is positive,
  // multiply the coefficient by 10 ** exponent.

  if (exponent > 0) {
    return make_big_float(
      JSBI.multiply(
        coefficient,
        JSBI.exponentiate(BIGINT_TEN, JSBI.BigInt(exponent))
      ),
      0
    );
  }

  // If the exponent is negative, divide the coefficient by 10 ** -exponent.
  // This truncates the unnecessary bits. This might be a zero result.

  return make_big_float(
    JSBI.divide(
      coefficient,
      JSBI.exponentiate(BIGINT_TEN, JSBI.BigInt(-exponent))
    ),
    0
  );
}

export function fraction(a: IBigFloat): IBigFloat {
  return sub(a, integer(a));
}

export function make(a: NumericValue, b?: number | string): IBigFloat {
  const number_pattern = /^(-?\d+)(?:\.(\d*))?(?:e(-?\d+))?$/;

  // . Capturing groups
  // .      [1] int
  // .      [2] frac
  // .      [3] exp
  if (a instanceof JSBI) {
    return make_big_float(a, Number(b) || 0);
  } else if (typeof a === "string" || typeof a === "number") {
    a = String(a);
    if (Number.isSafeInteger(Number(b))) {
      return make(JSBI.BigInt(parseInt(a, Number(b))), 0);
    }
    const parts = a.match(number_pattern);
    if (parts) {
      const frac = parts[2] || "";
      return make(
        JSBI.BigInt(parts[1] + frac),
        (Number(parts[3]) || 0) - frac.length
      );
    }
  } else if (is_big_float(a)) {
    return a;
  }
  return ZERO;
}

export function string(a: IBigFloat, radix?: IBigFloat): string | undefined {
  if (is_zero(a)) {
    return "0";
  }
  if (radix && is_big_float(radix)) {
    radix = normalize(radix);
    return radix && radix.exponent === 0
      ? integer(a).coefficient.toString(JSBI.toNumber(radix.coefficient))
      : undefined;
  }
  a = normalize(a);
  let s = (JSBI.LT(a.coefficient, BIGINT_ZERO)
    ? -a.coefficient
    : a.coefficient
  ).toString();
  if (a.exponent < 0) {
    let point = s.length + a.exponent;
    if (point <= 0) {
      s = "0".repeat(1 - point) + s;
      point = 1;
    }
    s = s.slice(0, point) + "." + s.slice(point);
  } else if (a.exponent > 0) {
    s += "0".repeat(a.exponent);
  }
  if (JSBI.LT(a.coefficient, BIGINT_ZERO)) {
    s = "-" + s;
  }
  return s;
}

export function scientific(a: IBigFloat): string {
  if (is_zero(a)) {
    return "0";
  }
  a = normalize(a);
  let s = String(
    JSBI.LT(a.coefficient, BIGINT_ZERO) ? -a.coefficient : a.coefficient
  );
  const e = a.exponent + s.length - 1;
  if (s.length > 1) {
    s = s.slice(0, 1) + "." + s.slice(1);
  }
  if (e !== 0) {
    s += "e" + e;
  }
  if (JSBI.LT(a.coefficient, BIGINT_ZERO)) {
    s = "-" + s;
  }
  return s;
}
