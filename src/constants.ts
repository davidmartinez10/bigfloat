import {make} from "./constructors.ts";
import type {IBigFloat} from "./types.ts";

export const BIGINT_ZERO: bigint        = BigInt("0");
export const BIGINT_ONE: bigint         = BigInt("1");
export const BIGINT_TEN: bigint         = BigInt("10");
export const BIGINT_TEN_MILLION: bigint = BigInt("10000000");
export const ZERO: IBigFloat            = Object.create(null);
ZERO.coefficient                        = BIGINT_ZERO;
ZERO.exponent                           = 0;
Object.freeze(ZERO);

export let PRECISION = -5;

export function set_precision(n: number) {
  n = Number(n);
  if (! Number.isInteger(n) || Number(n) >= 0) {
    throw Error("Only negative integers are allowed for precision.");
  }
  PRECISION = n;
}

export const EPSILON: IBigFloat
  = make("0.0000000000000000000000000000000000000000000000001");
export const ONE: IBigFloat = make("1");
export const TWO: IBigFloat = make("2");
