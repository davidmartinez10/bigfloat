import JSBI from "jsbi";

export interface IBigFloat {
  coefficient: JSBI;
  exponent: number;
}

export type NumericValue = string | number | IBigFloat | JSBI;

export type TokenArray = Array<
  { type: string; value: string | IBigFloat } | { type: string; value: boolean }
>;
