import JSBI from "jsbi";
import { BIGINT_ZERO } from "./constants.js";
import { integer } from "./constructors.js";
import { eq } from "./relational.js";
import { IBigFloat, NumericValue } from "./types";

export function is_big_float(big: NumericValue): boolean {
  return (
    typeof big === "object"
    && !(big instanceof JSBI)
    && big.coefficient instanceof JSBI
    && Number.isSafeInteger(big.exponent)
  );
}

export function is_number(token: string): boolean {
  return !Number.isNaN(Number(token));
}

export function is_negative(big: IBigFloat): boolean {
  return JSBI.LT(big.coefficient, BIGINT_ZERO);
}

export function is_positive(big: IBigFloat): boolean {
  return JSBI.GE(big.coefficient, BIGINT_ZERO);
}

export function is_zero(big: IBigFloat): boolean {
  return JSBI.EQ(big.coefficient, BIGINT_ZERO);
}

export function is_integer(a: IBigFloat): boolean {
  return eq(a, integer(a));
}
