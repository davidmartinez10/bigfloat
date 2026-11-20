import {add, div, exponentiation, modulo, mul, sub} from "./arithmetic.ts";
import {PRECISION, ZERO} from "./constants.ts";
import {make, normalize, string} from "./constructors.ts";
import {is_number, is_zero} from "./predicates.ts";
import {eq, gt, lt} from "./relational.ts";
import type {IBigFloat} from "./types.ts";

type TokenArray = ({
  type: string;
  value: string|IBigFloat
}|{
  type: string;
  value: boolean
})[];

export function evaluate(source: string,
                         precision = PRECISION): string|boolean {
  if (typeof source !== "string") {
    throw Error("The first parameter was expected to be a string.");
  }

  // This function relies on an algorithm that fully parenthesizes the
  // expression
  function parenthesize(expr: string) {
    return ("((((("
            + expr.replace(/\(/g, "((((")
                .replace(/\)/g, "))))")
                .replace(/(?<!\!)\=\=\=?/g, ")))==(((")
                .replace(/\<\=/g, ")))<=(((")
                .replace(/\>\=/g, ")))>=(((")
                .replace(/\<(?!\=)/g, ")))<(((")
                .replace(/\>(?!\=)/g, ")))>(((")
                .replace(/\!\=\=?/g, ")))!=(((")
                .replace(/(?<!e)\+/g, "))+((")
                .replace(/(?<!e)\-(?!\d)/g, "))-((")
                .replace(/\^|\*\*/g, "**")
                .replace(/(?<!\*)\*(?!\*)/g, ")*(")
                .replace(/\//g, ")/(")
                .replace(/\%/g, ")%(")
                .replace(/ /g, "")
            + ")))))");
  }

  const expression = parenthesize(source);
  const rx_tokens
    = /(-?\d+(?:\.\d+)?(?:(e|E)(-?|\+?)\d+)?)|(\(|\))|(\+|-|\/|\*\*|==|!=|<=?|>=?|\*|\^|%)/g;
  // Capture groups
  // [1] Number
  // [2] Paren
  // [3] Operator

  // Tokenize the expression
  const tokens = (expression.match(rx_tokens) || []).map(function(element) {
    const parens = ["(", ")"];
    const operators =
      ["+", "-", "*", "**", "/", "%", "==", "!=", "<", ">", "<=", ">="];
    if (parens.includes(element)) {
      return { type: "paren", value: element };
    } else if (operators.includes(element)) {
      return { type: "operator", value: element };
    } else if (is_number(element)) {
      return {
        type: "number",
        value: normalize(make(element.replace("+", "")))
      };
    }
    const error = "Unexpected token \"" + element + "\"";
    throw Error(error);
  });

  let n = 0;
  tokens.forEach(function(element, index) {
    if (element.value === "**") {
      if (tokens[index + 2].value === "**") {
        tokens.splice(index + 1, 0, { value: "(", type: "paren" });
        n += 1;
      } else {
        while (n) {
          n -= 1;
          tokens.splice(index + 3, 0, { value: ")", type: "paren" });
        }
      }
    }
  });

  // Recursively resolve the parentheses
  function resolve(arr: TokenArray): TokenArray {
    // Remove parens when there's only one value
    if (arr.length <= 3) { return [arr[1]]; }
    let last_left_paren = 0;
    let i               = 0;
    while (i <= arr.length) {
      const { value } = arr[i];
      if (value === "(") { last_left_paren = i; }
      if (value === ")") {
        const start = arr.slice(0, last_left_paren);
        const term  = arr.splice(last_left_paren, i - last_left_paren + 1);
        const end   = arr.slice(last_left_paren, arr.length);
        return resolve([...start, ...resolve(term), ...end]);
      }
      if (arr[i].type === "operator" && arr[i + 1].type !== "paren") {
        const start    = arr.slice(0, arr[i + 2].type === "operator"
                                          || arr[i + 2].type === "paren"
                                        ? last_left_paren + 1
                                        : last_left_paren);
        const ops      = arr.splice(i - 1, 3);
        const end      = arr.slice(arr[i - 1].type === "operator"
                                       || (arr[i + 1] || {}).type === "paren"
                                       || i >= arr.length
                                     ? i - 1
                                     : i,
                                   arr.length);
        const a        = ops[0].value as IBigFloat;
        const b        = ops[2].value as IBigFloat;
        const operator = ops[1].value as string;

        const bigfloat_return = ({
          "+"() { return add(a, b); },
          "-"() { return sub(a, b); },
          "*"() { return mul(a, b); },
          "/"() { return is_zero(b) ? ZERO : div(a, b, precision); },
          "**"() { return exponentiation(a, b); },
          "%"() { return modulo(a, b); },
        } as { [key: string]: () => IBigFloat })[operator];

        const boolean_return = ({
          "=="() { return eq(a, b); },
          "!="() { return ! eq(a, b); },
          "<"() { return lt(a, b); },
          ">"() { return gt(a, b); },
          "<="() { return lt(a, b) || eq(a, b); },
          ">="() { return gt(a, b) || eq(a, b); }
        } as { [key: string]: () => boolean })[operator];

        const res = bigfloat_return
                      ? { type: "number", value: bigfloat_return() }
                      : { type: "boolean", value: boolean_return() };

        return resolve([...start, res, ...end]);
      }
      i += 1;
    }
  }

  const [result] = resolve(tokens);

  if (result.type === "number") { return string(result.value as IBigFloat); }
  return result.value as string | boolean;
}
