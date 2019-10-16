import { sub } from "./arithmetic";
import { is_negative, is_zero } from "./predicates";
import { BigFloat } from "./types";

export function eq(comparahend: BigFloat, comparator: BigFloat) {
  return comparahend === comparator || is_zero(sub(comparahend, comparator));
}

export function lt(comparahend: BigFloat, comparator: BigFloat) {
  return is_negative(sub(comparahend, comparator));
}

export function lte(comparahend: BigFloat, comparator: BigFloat) {
  return lt(comparahend, comparator) || eq(comparahend, comparator);
}

export function gt(comparahend: BigFloat, comparator: BigFloat) {
  return lt(comparator, comparahend);
}

export function gte(comparahend: BigFloat, comparator: BigFloat) {
  return gt(comparahend, comparator) || eq(comparahend, comparator);
}
