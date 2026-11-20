import {evaluate} from "./interpreter.ts";
import {abs, add, ceil, div, eq, exponentiation, floor, gt, gte, is_integer, is_negative, is_positive, is_zero, lt, lte, make, make_big_float, modulo, mul, neg, PRECISION, set_precision, sqrt, string, sub} from "./lib.ts";
import type {IBigFloat, NumericValue} from "./lib.ts";

export class BigFloat implements IBigFloat {
  readonly exponent: number;
  readonly coefficient: bigint;
  readonly[Symbol.toStringTag] = "BigFloat" as const;
  constructor(n: NumericValue) {
    const { exponent, coefficient } = make(n);
    this.exponent                   = exponent;
    this.coefficient                = coefficient;
    if (! (this instanceof BigFloat)) { return new BigFloat(n); }
  }

  static get precision(): number { return PRECISION; }
  static set precision(n: number) { set_precision(n); }
  static evaluate = evaluate;

  decimalPlaces(): number { return Number(-this.exponent); } // WRONG
  isInteger(): boolean { return is_integer(this); }
  isNegative(): boolean { return is_negative(this); }
  isPositive(): boolean { return is_positive(this); }
  isZero(): boolean { return is_zero(this); }
  equals(y: NumericValue): boolean { return eq(this, make(y)); }
  greaterThan(y: NumericValue): boolean { return gt(this, make(y)); }
  greaterThanOrEqualTo(y: NumericValue): boolean { return gte(this, make(y)); }
  lessThan(y: NumericValue): boolean { return lt(this, make(y)); }
  lessThanOrEqualTo(y: NumericValue): boolean { return lte(this, make(y)); }
  absoluteValue(): BigFloat { return new BigFloat(abs(this)); }
  negated(): BigFloat { return new BigFloat(neg(this)); }
  squareRoot(): BigFloat { return new BigFloat(sqrt(this)); }
  dividedBy(y: NumericValue): BigFloat {
    return new BigFloat(div(this, make(y)));
  }
  minus(y: NumericValue): BigFloat { return new BigFloat(sub(this, make(y))); }
  plus(y: NumericValue): BigFloat { return new BigFloat(add(this, make(y))); }
  times(y: NumericValue): BigFloat { return new BigFloat(mul(this, make(y))); }
  toPower(y: NumericValue): BigFloat {
    return new BigFloat(exponentiation(this, make(y)));
  }
  ceil(): BigFloat { return new BigFloat(ceil(this)); }
  floor(): BigFloat { return new BigFloat(floor(this)); }
  modulo(y: NumericValue): BigFloat {
    return new BigFloat(modulo(this, make(y)));
  }

  toString(): string { return string(this); }
  valueOf(): IBigFloat {
    return make_big_float(this.coefficient, this.exponent);
  }

  // aliases
  dp    = this.decimalPlaces;
  isNeg = this.isNegative;
  eq    = this.equals;
  gt    = this.greaterThan;
  gte   = this.greaterThanOrEqualTo;
  lt    = this.lessThan;
  lte   = this.lessThanOrEqualTo;
  isInt = this.isInteger;
  isPos = this.isPositive;
  abs   = this.absoluteValue;
  neg   = this.negated;
  sqrt  = this.squareRoot;
  div   = this.dividedBy;
  sub   = this.minus;
  add   = this.plus;
  mul   = this.times;
  pow   = this.toPower;
  mod   = this.modulo;
}
