import JSBI from "jsbi";
import { BIGINT_ONE, BIGINT_TEN, EPSILON, ONE, PRECISION, TWO, ZERO } from "./constants";
import { integer, make_big_float, number } from "./constructors";
import { is_integer, is_negative, is_zero } from "./predicates";
import { eq, gt, lt } from "./relational";
import { BigFloat } from "./types";

export function neg(a: BigFloat) {
  return make_big_float(JSBI.unaryMinus(a.coefficient), a.exponent);
}

export function abs(a: BigFloat) {
  return is_negative(a) ? neg(a) : a;
}

function conform_op(op: (a: JSBI, b: JSBI) => JSBI) {
  return function(a: BigFloat, b: BigFloat) {
    const differential = a.exponent - b.exponent;
    return differential === 0
      ? make_big_float(op(a.coefficient, b.coefficient), a.exponent)
      : differential > 0
      ? make_big_float(
          op(
            JSBI.multiply(
              a.coefficient,
              JSBI.exponentiate(BIGINT_TEN, JSBI.BigInt(differential))
            ),
            b.coefficient
          ),
          b.exponent
        )
      : make_big_float(
          op(
            a.coefficient,
            JSBI.multiply(
              b.coefficient,
              JSBI.exponentiate(BIGINT_TEN, JSBI.BigInt(-differential))
            )
          ),
          a.exponent
        );
  };
}

export const add = conform_op(JSBI.add);
export const sub = conform_op(JSBI.subtract);

export function mul(multiplicand: BigFloat, multiplier: BigFloat) {
  return make_big_float(
    JSBI.multiply(multiplicand.coefficient, multiplier.coefficient),
    multiplicand.exponent + multiplier.exponent
  );
}

export function div(
  dividend: BigFloat,
  divisor: BigFloat,
  precision = PRECISION
): BigFloat {
  if (is_zero(dividend) || is_zero(divisor)) {
    return ZERO;
  }

  let { coefficient, exponent } = dividend;
  exponent -= divisor.exponent;

  if (typeof precision !== "number") {
    precision = number(precision);
  }

  if (exponent > precision) {
    coefficient = JSBI.multiply(
      coefficient,
      JSBI.exponentiate(BIGINT_TEN, JSBI.BigInt(exponent - precision))
    );
    exponent = precision;
  }

  coefficient = JSBI.divide(coefficient, divisor.coefficient);
  return make_big_float(coefficient, exponent);
}

export function sqrt(n: BigFloat) {
  let x = n;
  let y = ONE;
  while (gt(sub(x, y), EPSILON)) {
    x = div(add(x, y), TWO);
    y = div(n, x);
  }
  return x;
}

export function exponentiation(base: BigFloat, exp: BigFloat): BigFloat {
  if (eq(exp, ZERO)) {
    return ONE;
  }

  if (is_negative(exp)) {
    return div(ONE, exponentiation(base, abs(exp)));
  }

  if (exp.exponent === 0) {
    let result = base;
    let n = 1;
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
  let low = ZERO;
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
      acc = mul(acc, div(ONE, sqr));
    }
    mid = div(add(low, high), TWO);
  }
  return acc;
}

export function ceil(n: BigFloat) {
  if (is_integer(n)) {
    return n;
  } else {
    return make_big_float(JSBI.add(integer(n).coefficient, BIGINT_ONE), 0);
  }
}

export function floor(n: BigFloat) {
  return integer(n);
}
