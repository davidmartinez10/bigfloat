import * as arithmetic from "./arithmetic.js";
import * as constructors from "./constructors.js";
import * as predicates from "./predicates.js";
import * as relational from "./relational.js";
import evaluate from "./interpreter.js";
import { set_precision } from "./constants.js";

export { BigFloat } from "./bigfloat.js";
export { IBigFloat } from "./types";

const bigfloat = {
  evaluate,
  set_precision,
  ...arithmetic,
  ...predicates,
  ...constructors,
  ...relational
};

if (typeof module === "object") {
  Object.assign(exports, bigfloat);
}

export default bigfloat;
