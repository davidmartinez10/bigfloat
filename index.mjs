// big_float.js
// David Martínez (based on the original work by Douglas Crockford)
// 2019-03-10

// You can access the big decimal floating point object in your module
// by importing it.

//      import big_float from "./big_float.js";

//      big_float.eq(
//          big_float.add(
//              big_float.make("0.1"),
//              big_float.make("0.2")
//          ),
//          big_float.make("0.3")
//      )                           // true

/*jslint bitwise */

/*property
    abs, abs_lt, add, coefficient, create, div, divrem, eq, exponent, fraction,
    freeze, integer, isFinite, isSafeInteger, is_big_float, is_big_integer,
    is_negative, is_positive, is_zero, length, lt, make, match, mul, neg,
    normalize, number, power, repeat, scientific, sign, signum, slice, string,
    sub, ten, two, zero, evaluate
*/

function is_big_float(big) {
  return (
    typeof big === "object"
    && typeof big.coefficient === "bigint"
    && Number.isSafeInteger(big.exponent)
  );
}

function is_negative(big) {
  return big.coefficient < 0n;
}

function is_positive(big) {
  return big.coefficient >= 0n;
}

function is_zero(big) {
  return big.coefficient === 0n;
}

const zero = Object.create(null);
zero.coefficient = 0n;
zero.exponent = 0;
Object.freeze(zero);

function make_big_float(coefficient, exponent) {
  if (coefficient === 0n) {
    return zero;
  }
  const new_big_float = Object.create(null);
  new_big_float.coefficient = coefficient;
  new_big_float.exponent = exponent;
  return Object.freeze(new_big_float);
}

const big_integer_ten_million = 10000000n;

function number(a) {
  return (
    is_big_float(a)
      ? (
        a.exponent === 0
          ? Number(a.coefficient)
          : Number(a.coefficient) * (10 ** a.exponent)
      )
      : (
        typeof a === "number"
          ? a
          : Number(a)
      )
  );
}

function neg(a) {
  return make_big_float(-a.coefficient, a.exponent);
}

function abs(a) {
  return (
    is_negative(a)
      ? neg(a)
      : a
  );
}

function conform_op(op) {
  return function (a, b) {
    const differential = b.exponent - a.exponent;
    return (
      differential === 0
        ? make_big_float(op(a.coefficient, b.coefficient), a.exponent)
        : (
          differential < 0
            ? make_big_float(
              op(
                (
                  a.coefficient
                  * (10n ** BigInt(-differential))
                ),
                b.coefficient
              ),
              b.exponent
            )
            : make_big_float(
              op(
                a.coefficient,
                b.coefficient * (10n ** BigInt(differential))
              ),
              a.exponent
            )
        )
    );
  };
}

const add = conform_op(function (a, b) {
  return a + b;
});
const sub = conform_op(function (a, b) {
  return a - b;
});

function eq(comparahend, comparator) {
  return comparahend === comparator || is_zero(sub(comparahend, comparator));
}

function lt(comparahend, comparator) {
  return is_negative(sub(comparahend, comparator));
}

function mul(multiplicand, multiplier) {
  return make_big_float(
    multiplicand.coefficient * multiplier.coefficient,
    multiplicand.exponent + multiplier.exponent
  );
}

function abs_lt(comparahend, comparator) {
  return (
    String(
      comparahend < 0n
        ? -comparahend
        : comparahend
    ).length
    < String(
      comparator < 0n
        ? -comparator
        : comparator
    ).length
  );
}

function div(dividend, divisor, precision = -4) {
  if (is_zero(dividend)) {
    return zero;
  }
  if (is_zero(divisor)) {
    return undefined;
  }
  let { coefficient, exponent } = dividend;
  exponent -= divisor.exponent;

  // Scale the coefficient to the desired precision.

  if (typeof precision !== "number") {
    precision = number(precision);
  }
  if (exponent > precision) {
    coefficient = coefficient * (10n ** BigInt(exponent - precision));
    exponent = precision;
  }
  coefficient = coefficient / divisor.coefficient;

  return make_big_float(coefficient, exponent);
}


function normalize(a) {
  let { coefficient, exponent } = a;

  // If the exponent is zero, it is already normal.

  if (exponent !== 0) {

    // If the exponent is positive, multiply the coefficient by '10 **' exponent.

    if (exponent > 0) {
      coefficient = coefficient * (10n ** BigInt(exponent));
      exponent = 0;
    } else {
      let quotient;
      let remainder;

      // While the exponent is negative, if the coefficient is divisible by ten,
      // then we do the division and add '1' to the exponent.

      // To help this go a little faster, we first try units of ten million,
      // reducing 7 zeros at a time.

      while (exponent <= -7 && (coefficient % 10n === 0n)) {
        [quotient, remainder] = [
          coefficient / big_integer_ten_million,
          coefficient % big_integer_ten_million
        ];
        if (remainder !== 0n) {
          break;
        }
        coefficient = quotient;
        exponent += 7;
      }
      while (exponent < 0 && (coefficient % 10n === 0n)) {
        [quotient, remainder] = [
          coefficient / 10n,
          coefficient % 10n
        ];
        if (remainder !== 0n) {
          break;
        }
        coefficient = quotient;
        exponent += 1;
      }
    }
  }
  return make_big_float(coefficient, exponent);
}

function integer(a) {

  // The integer function is like the normalize function except that it throws
  // away significance. It discards the digits after the decimal point.

  let { coefficient, exponent } = a;

  // If the exponent is zero, it is already an integer.

  if (exponent === 0) {
    return a;
  }

  // If the exponent is positive,
  // multiply the coefficient by 10 ** exponent.

  if (exponent > 0) {
    return make_big_float(coefficient * (10n ** BigInt(exponent)), 0);
  }

  // If the exponent is negative, divide the coefficient by 10 ** -exponent.
  // This truncates the unnecessary bits. This might be a zero result.

  return make_big_float(coefficient / (10n ** BigInt(-exponent)), 0);
}

function fraction(a) {
  return sub(a, integer(a));
}

function deconstruct(number) {

  // This function deconstructs a number, reducing it to its components:
  // a sign, an integer coefficient, and an exponent, such that

  //  '      number = sign * coefficient * (2 ** exponent)'

  let sign = 1;
  let coefficient = number;
  let exponent = 0;

  // Remove the sign from the coefficient.

  if (coefficient < 0) {
    coefficient = -coefficient;
    sign = -1;
  }

  if (Number.isFinite(number) && number !== 0) {

    // Reduce the coefficient: We can obtain the exponent by dividing the number by
    // two until it goes to zero. We add the number of divisions to -1128, which is
    // the exponent of 'Number.MIN_VALUE' minus the number of bits in the
    // significand minus the bonus bit.

    exponent = -1128;
    let reduction = coefficient;
    while (reduction !== 0) {

      // This loop is guaranteed to reach zero. Each division will decrement the
      // exponent of the reduction. When the exponent is so small that it can not
      // be decremented, then the internal subnormal significand will be shifted
      // right instead. Ultimately, all of the bits will be shifted out.

      exponent += 1;
      reduction /= 2;
    }

    // Reduce the exponent: When the exponent is zero, the number can be viewed
    // as an integer. If the exponent is not zero, then adjust to correct the
    // coefficient.

    reduction = exponent;
    while (reduction > 0) {
      coefficient /= 2;
      reduction -= 1;
    }
    while (reduction < 0) {
      coefficient *= 2;
      reduction += 1;
    }
  }

  // Return an object containing the three components and the original number.

  return {
    sign,
    coefficient,
    exponent,
    number
  };
}

const number_pattern = /^(-?\d+)(?:\.(\d*))?(?:e(-?\d+))?$/;

//. Capturing groups
//.      [1] int
//.      [2] frac
//.      [3] exp

function make(a, b) {

  //.      (big_integer)
  //.      (big_integer, exponent)
  //.      (string)
  //.      (string, radix)
  //.      (number)

  if (typeof a === "bigint") {
    return make_big_float(a, b || 0);
  }
  if (typeof a === "string") {
    if (Number.isSafeInteger(b)) {
      return make(BigInt(parseInt(a, b)), 0);
    }
    let parts = a.match(number_pattern);
    if (parts) {
      let frac = parts[2] || "";
      return make(
        BigInt(parts[1] + frac),
        (Number(parts[3]) || 0) - frac.length
      );
    }
  }

  // If 'a' is a number, then we deconstruct it into its basis '2' exponent
  // and coefficient, and then reconstruct as a precise big float.

  if (typeof a === "number" && Number.isFinite(a)) {
    if (a === 0) {
      return zero;
    }
    let { sign, coefficient, exponent } = deconstruct(a);
    if (sign < 0) {
      coefficient = -coefficient;
    }
    coefficient = BigInt(coefficient);

    // If the exponent is negative, then we can divide by '2 ** abs(exponent)'.

    if (exponent < 0) {
      return normalize(div(
        make(coefficient, 0),
        make(2n ** BigInt(-exponent), 0),
        b
      ));
    }

    // If the exponent is greater than zero, then we can multiply the coefficient
    // by '2 **' exponent.

    if (exponent > 0) {
      coefficient = coefficient * (2n ** BigInt(exponent));
      exponent = 0;
    }
    return make(coefficient, exponent);
  }
  if (is_big_float(a)) {
    return a;
  }
}

function string(a, radix) {
  if (is_zero(a)) {
    return "0";
  }
  a = normalize(a);
  let s = String((
    a.coefficient < 0n
      ? -a.coefficient
      : a.coefficient
  ));
  if (a.exponent < 0) {
    let point = s.length + a.exponent;
    if (point <= 0) {
      s = "0".repeat(1 - point) + s;
      point = 1;
    }
    s = s.slice(0, point) + "." + s.slice(point);
  } else if (a.exponent > 0) {
    s += "0".repeat(a.exponent);
  }
  if (a.coefficient < 0n) {
    s = "-" + s;
  }
  return s;
}

function scientific(a) {
  if (is_zero(a)) {
    return "0";
  }
  a = normalize(a);
  let s = String((
    a.coefficient < 0n
      ? -a.coefficient
      : a.coefficient
  ));
  let e = a.exponent + s.length - 1;
  if (s.length > 1) {
    s = s.slice(0, 1) + "." + s.slice(1);
  }
  if (e !== 0) {
    s += "e" + e;
  }
  if (a.coefficient < 0n) {
    s = "-" + s;
  }
  return s;
}

function evaluate(source, precision = -4) {
  if (typeof source !== "string") {
    throw new Error("The first parameter was expected to be a string.");
  }
  // This function relies on an algorithm that fully parenthesizes the expression
  function parenthesize(expr) {
    return (
      "(((("
      + expr
        .replace(/\(/g, "((((")
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
        .replace(/\%/g, ")%((")
        .replace(/ /g, "")
      + "))))"
    );
  }

  const expression = parenthesize(source);
  const rx_tokens = /(-?\d+(?:\.\d+)?(?:e(\-?|\+?)\d+)?)|(\(|\))|(\+|\-|\/|\*\*|(?<!\!)\=\=|\!\=|\<\=?|\>\=?|\*|\^|\%)/g;
  // Capture groups
  // [1] Number
  // [2] Paren
  // [3] Operator

  function is_number(n) {
    return !Number.isNaN(Number(n));
  }

  // Tokenize the expression
  let tokens = expression.match(rx_tokens).map(function (element) {

    const parens = ["(", ")"];
    const operators = ["+", "-", "*", "**", "/", "%", "==", "!=", "<", ">", "<=", ">="];

    if (parens.includes(element)) {
      return {
        type: "paren",
        value: element
      }
    } else if (operators.includes(element)) {
      return {
        type: "operator",
        value: element
      }
    } else if (is_number(element)) {
      return {
        type: "number",
        value: normalize(make(element.replace("+", "")))
      }
    } else {
      const error = "Unexpected token \"" + element + "\"";
      throw new Error(error);
    }
  });

  let n = 0;
  tokens.forEach(function (element, index) {
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
  function resolve(arr) {
    // Remove parens when there's only one value
    if (arr.length <= 3) {
      return [arr[1]];
    }
    let last_left_paren;
    let i = 0;
    while (i <= arr.length) {
      const { value } = arr[i];
      if (value === "(") {
        last_left_paren = i;
      }
      if (value === ")") {
        const start = arr.slice(0, last_left_paren);
        const term = arr.splice(last_left_paren, i - last_left_paren + 1);
        const end = arr.slice(last_left_paren, arr.length);
        return resolve([
          ...start,
          ...resolve(term),
          ...end
        ]);
      }
      if (arr[i].type === "operator" && arr[i + 1].type !== "paren") {
        const start = arr.slice(0, (
          arr[i + 2].type === "operator"
            || arr[i + 2].type === "paren"
            ? last_left_paren + 1
            : last_left_paren
        )
        );
        const ops = arr.splice(i - 1, 3);
        const end = arr.slice((
          arr[i - 1].type === "operator"
            || (arr[i + 1] || {}).type === "paren"
            || i >= arr.length
            ? i - 1
            : i
        ), arr.length);
        const a = ops[0].value;
        const b = ops[2].value;
        let value;
        let type = "number";
        switch (ops[1].value) {
          case "+":
            value = add(a, b);
            break;
          case "-":
            value = sub(a, b);
            break;
          case "*":
            value = mul(a, b);
            break;
          case "/":
            value = div(a, b, precision);
            break;
          // For the moment only integer exponents are supported in the power() function
          case "**":
            value = a;
            let n = 1;
            while (true) {
              if (b.exponent !== 0) {
                throw new Error("Exponents containing decimal fractions are not supported yet.")
              }
              if (n === number(b)) {
                break;
              }
              value = mul(value, a);
              n += 1;
            }
            break;
          case "==":
            type = "boolean";
            value = eq(a, b);
            break;
          case "!=":
            type = "boolean";
            value = !eq(a, b);
            break;
          case "<":
            type = "boolean";
            value = lt(a, b);
            break;
          case ">":
            type = "boolean";
            value = lt(b, a);
            break;
          case "<=":
            type = "boolean";
            value = lt(a, b) || eq(a, b);
            break;
          case ">=":
            type = "boolean";
            value = lt(b, a) || eq(a, b);
        }

        const result = {
          type,
          value
        };
        return resolve([
          ...start,
          result,
          ...end
        ]);
      }
      i += 1;
    }
  }

  const [result] = resolve(tokens);

  if (result.type === "number") {
    return string(result.value);
  }
  return result.value;
}

export default Object.freeze({
  abs,
  add,
  div,
  eq,
  fraction,
  integer,
  is_big_float,
  is_negative,
  is_positive,
  is_zero,
  lt,
  make,
  mul,
  neg,
  normalize,
  number,
  scientific,
  string,
  sub,
  zero,
  evaluate
});
