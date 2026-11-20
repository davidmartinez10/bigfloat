export interface IBigFloat {
  coefficient: bigint;
  exponent: number;
}

export type NumericValue = string|number|IBigFloat|bigint;
