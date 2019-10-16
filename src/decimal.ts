import JSBI from "jsbi";
import { abs, add, ceil, div, exponentiation, floor, mul, neg, sqrt, sub } from "./arithmetic";
import { set_precision } from "./constants";
import { make, string } from "./constructors";
import { is_integer, is_negative, is_positive, is_zero } from "./predicates";
import { eq, gt, gte, lt, lte } from "./relational";
import { BigFloat, NumericValue } from "./types";

export class Decimal implements BigFloat {
    public exponent: number;
    public coefficient: JSBI;
    public setPrecision = set_precision;
    constructor(n: NumericValue) {
      const { exponent, coefficient } = make(n);
      this.exponent = exponent;
      this.coefficient = coefficient;
    }
    public decimalPlaces = () => -this.exponent;
    public dp = () => -this.exponent;
    public isInteger = () => is_integer(this);
    public isInt = () => is_integer(this);
    public isNegative = () => is_negative(this);
    public isNeg = () => is_negative(this);
    public isPositive = () => is_positive(this);
    public isPos = () => is_positive(this);
    public isZero = () => is_zero(this);
    public toString = () => string(this);
    public equals = (y: NumericValue) => eq(this, make(y));
    public eq = (y: NumericValue) => eq(this, make(y));
    public greaterThan = (y: NumericValue) => gt(this, make(y));
    public gt = (y: NumericValue) => gt(this, make(y));
    public greaterThanOrEqualTo = (y: NumericValue) => gte(this, make(y));
    public gte = (y: NumericValue) => gte(this, make(y));
    public lessThan = (y: NumericValue) => lt(this, make(y));
    public lt = (y: NumericValue) => lt(this, make(y));
    public lessThanOrEqualTo = (y: NumericValue) => lte(this, make(y));
    public lte = (y: NumericValue) => lte(this, make(y));
    public absoluteValue = () => new Decimal(abs(this));
    public abs = () => new Decimal(abs(this));
    public negated = () => new Decimal(neg(this));
    public neg = () => new Decimal(neg(this));
    public squareRoot = () => new Decimal(sqrt(this));
    public sqrt = () => new Decimal(sqrt(this));
    public dividedBy = (y: NumericValue) => new Decimal(div(this, make(y)));
    public div = (y: NumericValue) => new Decimal(div(this, make(y)));
    public minus = (y: NumericValue) => new Decimal(sub(this, make(y)));
    public sub = (y: NumericValue) => new Decimal(sub(this, make(y)));
    public plus = (y: NumericValue) => new Decimal(add(this, make(y)));
    public add = (y: NumericValue) => new Decimal(add(this, make(y)));
    public times = (y: NumericValue) => new Decimal(mul(this, make(y)));
    public mul = (y: NumericValue) => new Decimal(mul(this, make(y)));
    public toPower = (y: NumericValue) =>
      new Decimal(exponentiation(this, make(y)))
    public pow = (y: NumericValue) => new Decimal(exponentiation(this, make(y)));
    public ceil = () => new Decimal(ceil(this));
    public floor = () => new Decimal(floor(this));
  }
