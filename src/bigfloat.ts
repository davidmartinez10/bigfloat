import JSBI from "jsbi";
import { abs, add, ceil, div, exponentiation, floor, mul, neg, sqrt, sub } from "./arithmetic.js";
import { make, string } from "./constructors.js";
import { is_integer, is_negative, is_positive, is_zero } from "./predicates.js";
import { eq, gt, gte, lt, lte } from "./relational.js";
import { IBigFloat, NumericValue } from "./types";

export class BigFloat implements IBigFloat {
  public exponent: number;
  public coefficient: JSBI;
  constructor(n: NumericValue) {
    const { exponent, coefficient } = make(n);
    this.exponent = exponent;
    this.coefficient = coefficient;
  }

  public decimalPlaces(): number { return -this.exponent; }
  public isInteger(): boolean { return is_integer(this); }
  public isNegative(): boolean { return is_negative(this); }
  public isPositive(): boolean { return is_positive(this); }
  public isZero(): boolean { return is_zero(this); }
  public toString(): string { return string(this) as string; }
  public equals(y: NumericValue): boolean { return eq(this, make(y)); }
  public greaterThan(y: NumericValue): boolean { return gt(this, make(y)); }
  public greaterThanOrEqualTo(y: NumericValue): boolean { return gte(this, make(y)); }
  public lessThan(y: NumericValue): boolean { return lt(this, make(y)); }
  public lessThanOrEqualTo(y: NumericValue): boolean { return lte(this, make(y)); }
  public absoluteValue(): BigFloat { return new BigFloat(abs(this)); }
  public negated(): BigFloat { return new BigFloat(neg(this)); }
  public squareRoot(): BigFloat { return new BigFloat(sqrt(this)); }
  public dividedBy(y: NumericValue): BigFloat { return new BigFloat(div(this, make(y))); }
  public minus(y: NumericValue): BigFloat { return new BigFloat(sub(this, make(y))); }
  public plus(y: NumericValue): BigFloat { return new BigFloat(add(this, make(y))); }
  public times(y: NumericValue): BigFloat { return new BigFloat(mul(this, make(y))); }
  public toPower(y: NumericValue): BigFloat { return new BigFloat(exponentiation(this, make(y))); }
  public ceil(): BigFloat { return new BigFloat(ceil(this)); }
  public floor(): BigFloat { return new BigFloat(floor(this)); }

  public dp = this.decimalPlaces;
  public isNeg = this.isNegative;
  public eq = this.equals;
  public gt = this.greaterThan;
  public gte = this.greaterThanOrEqualTo;
  public lt = this.lessThan;
  public lte = this.lessThanOrEqualTo;
  public isInt = this.isInteger;
  public isPos = this.isPositive;
  public abs = this.absoluteValue;
  public neg = this.negated;
  public sqrt = this.squareRoot;
  public div = this.dividedBy;
  public sub = this.minus;
  public add = this.plus;
  public mul = this.times;
  public pow = this.toPower;
}
