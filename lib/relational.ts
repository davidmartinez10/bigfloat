import {sub} from "./arithmetic.ts";
import {is_negative, is_zero} from "./predicates.ts";
import type {IBigFloat} from "./types.ts";

export function eq(comparahend: IBigFloat, comparator: IBigFloat): boolean {
  return comparahend === comparator || is_zero(sub(comparahend, comparator));
}

export function lt(comparahend: IBigFloat, comparator: IBigFloat): boolean {
  return is_negative(sub(comparahend, comparator));
}

export function lte(comparahend: IBigFloat, comparator: IBigFloat): boolean {
  return lt(comparahend, comparator) || eq(comparahend, comparator);
}

export function gt(comparahend: IBigFloat, comparator: IBigFloat): boolean {
  return lt(comparator, comparahend);
}

export function gte(comparahend: IBigFloat, comparator: IBigFloat): boolean {
  return gt(comparahend, comparator) || eq(comparahend, comparator);
}
