import JSBI from "jsbi";
import { BIGINT_ZERO } from "./constants";
import { integer } from "./constructors";
import { eq } from "./relational";
import { BigFloat } from "./types";

export function is_big_float(big: any) {
  return (
    typeof big === "object" &&
    big.coefficient instanceof JSBI &&
    Number.isSafeInteger(big.exponent)
  );
}

export function is_number(token: string) {
  return !Number.isNaN(Number(token));
}

export function is_negative(big: BigFloat) {
  return JSBI.LT(big.coefficient, BIGINT_ZERO);
}

export function is_positive(big: BigFloat) {
  return JSBI.GE(big.coefficient, BIGINT_ZERO);
}

export function is_zero(big: BigFloat) {
  return JSBI.EQ(big.coefficient, BIGINT_ZERO);
}

export function is_integer(a: BigFloat) {
  return eq(a, integer(a));
}
