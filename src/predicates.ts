import {BIGINT_ZERO} from "./constants.ts";
import {integer} from "./constructors.ts";
import {eq} from "./relational.ts";
import type {IBigFloat, NumericValue} from "./types.ts";

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
  return big.coefficient >= BIGINT_ZERO;
}

export function is_zero(big: IBigFloat): boolean {
  return big.coefficient === BIGINT_ZERO;
}

export function is_integer(a: IBigFloat): boolean { return eq(a, integer(a)); }
