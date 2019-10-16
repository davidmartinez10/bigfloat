import JSBI from "jsbi";

export interface BigFloat {
  coefficient: JSBI;
  exponent: number;
}

export type NumericValue = string | number | BigFloat | JSBI;

export type TokenArray = Array<
  { type: string; value: string | BigFloat } | { type: string; value: boolean }
>;
