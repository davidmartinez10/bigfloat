// big_float.js
// David Martínez (based on the original work by Douglas Crockford)
// 2019-03-29

const big_integer = require("./bigint.js");

const PRECISION = -24;

function is_big_float(big) {
  return (
    typeof big === "object"
    && big_integer.is_big_integer(big.coefficient)
    && Number.isSafeInteger(big.exponent)
  );
}

function is_negative(big) {
  return big_integer.is_negative(big.coefficient);
}

function is_positive(big) {
  return big_integer.is_positive(big.coefficient);
}

function is_zero(big) {
  return big_integer.is_zero(big.coefficient);
}

const zero = Object.create(null);
zero.coefficient = big_integer.zero;
zero.exponent = 0;
Object.freeze(zero);

function make_big_float(coefficient, exponent) {
  if (big_integer.is_zero(coefficient)) {
    return zero;
  }
  const new_big_float = Object.create(null);
  new_big_float.coefficient = coefficient;
  new_big_float.exponent = exponent;
  return Object.freeze(new_big_float);
}

const big_integer_ten_million = big_integer.make(10000000);

function number(a) {
  return (
    is_big_float(a)
      ? (
        a.exponent === 0
          ? big_integer.number(a.coefficient)
          : big_integer.number(a.coefficient) * (10 ** a.exponent)
      )
      : (
        typeof a === "number"
          ? a
          : (
            big_integer.is_big_integer(a)
              ? big_integer.number(a)
              : Number(a)
          )
      )
  );
}

function neg(a) {
  return make_big_float(big_integer.neg(a.coefficient), a.exponent);
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
    const differential = a.exponent - b.exponent;
    return (
      differential === 0
        ? make_big_float(op(a.coefficient, b.coefficient), a.exponent)
        : (
          differential > 0
            ? make_big_float(
              op(
                big_integer.mul(
                  a.coefficient,
                  big_integer.power(big_integer.ten, big_integer.make(differential))
                ),
                b.coefficient
              ),
              b.exponent
            )
            : make_big_float(
              op(
                a.coefficient,
                big_integer.mul(
                  b.coefficient,
                  big_integer.power(big_integer.ten, big_integer.make(-differential))
                )
              ),
              a.exponent
            )
        )
    );
  };
}

const add = conform_op(big_integer.add);
const sub = conform_op(big_integer.sub);

function eq(comparahend, comparator) {
  return comparahend === comparator || is_zero(sub(comparahend, comparator));
}

function lt(comparahend, comparator) {
  return is_negative(sub(comparahend, comparator));
}

function gt(comparahend, comparator) {
  return lt(comparator, comparahend);
}

function mul(multiplicand, multiplier) {
  return make_big_float(
    big_integer.mul(multiplicand.coefficient, multiplier.coefficient),
    multiplicand.exponent + multiplier.exponent
  );
}

function div(dividend, divisor, precision = PRECISION) {
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
    coefficient = big_integer.mul(
      coefficient,
      big_integer.power(big_integer.ten, big_integer.make(exponent - precision))
    );
    exponent = precision;
  }
  [coefficient] = big_integer.divrem(
    coefficient,
    divisor.coefficient
  );
  return make_big_float(coefficient, exponent);
}

function normalize(a) {
  let { coefficient, exponent } = a;

  // If the exponent is zero, it is already normal.

  if (exponent !== 0) {

    // If the exponent is positive, multiply the coefficient by '10 **' exponent.

    if (exponent > 0) {
      coefficient = big_integer.mul(
        coefficient,
        big_integer.power(big_integer.ten, big_integer.make(exponent))
      );
      exponent = 0;
    } else {
      let quotient;
      let remainder;

      // While the exponent is negative, if the coefficient is divisible by ten,
      // then we do the division and add '1' to the exponent.

      // To help this go a little faster, we first try units of ten million,
      // reducing 7 zeros at a time.

      while (exponent <= -7 && (coefficient[1] & 127) === 0) {
        [quotient, remainder] = big_integer.divrem(
          coefficient,
          big_integer_ten_million
        );
        if (remainder !== big_integer.zero) {
          break;
        }
        coefficient = quotient;
        exponent += 7;
      }
      while (exponent < 0 && (coefficient[1] & 1) === 0) {
        [quotient, remainder] = big_integer.divrem(
          coefficient,
          big_integer.ten
        );
        if (remainder !== big_integer.zero) {
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

  const { coefficient, exponent } = a;
  if (coefficient.length < 2) {
    return zero;
  }

  // If the exponent is zero, it is already an integer.

  if (exponent === 0) {
    return a;
  }

  // If the exponent is positive,
  // multiply the coefficient by 10 ** exponent.

  if (exponent > 0) {
    return make_big_float(
      big_integer.mul(
        coefficient,
        big_integer.power(big_integer.ten, big_integer.make(exponent))
      ),
      0
    );
  }

  // If the exponent is negative, divide the coefficient by 10 ** -exponent.
  // This truncates the unnecessary bits. This might be a zero result.

  return make_big_float(
    big_integer.div(
      coefficient,
      big_integer.power(big_integer.ten, big_integer.make(-exponent))
    ),
    0
  );
}

function fraction(a) {
  return sub(a, integer(a));
}

function deconstruct(n) {

  // This function deconstructs a number, reducing it to its components:
  // a sign, an integer coefficient, and an exponent, such that

  //  '      number = sign * coefficient * (2 ** exponent)'

  let sign = 1;
  let coefficient = n;
  let exponent = 0;

  // Remove the sign from the coefficient.

  if (coefficient < 0) {
    coefficient = -coefficient;
    sign = -1;
  }

  if (Number.isFinite(n) && n !== 0) {

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
    number: n
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

  if (big_integer.is_big_integer(a)) {
    return make_big_float(a, b || 0);
  }
  if (typeof a === "string") {
    if (Number.isSafeInteger(b)) {
      return make(big_integer.make(a, b), 0);
    }
    const parts = a.match(number_pattern);
    if (parts) {
      const frac = parts[2] || "";
      return make(
        big_integer.make(parts[1] + frac),
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
    coefficient = big_integer.make(coefficient);

    // If the exponent is negative, then we can divide by '2 ** abs(exponent)'.

    if (exponent < 0) {
      return normalize(div(
        make(coefficient, 0),
        make(big_integer.power(big_integer.two, big_integer.make(-exponent)), 0),
        b
      ));
    }

    // If the exponent is greater than zero, then we can multiply the coefficient
    // by '2 **' exponent.

    if (exponent > 0) {
      coefficient = big_integer.mul(
        coefficient,
        big_integer.power(big_integer.two, big_integer.make(exponent))
      );
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
  if (is_big_float(radix)) {
    radix = normalize(radix);
    return (
      (radix && radix.exponent === 0)
        ? big_integer.string(integer(a).coefficient, radix.coefficient)
        : undefined
    );
  }
  a = normalize(a);
  let s = big_integer.string(big_integer.abs(a.coefficient));
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
  if (big_integer.is_negative(a.coefficient)) {
    s = "-" + s;
  }
  return s;
}

function scientific(a) {
  if (is_zero(a)) {
    return "0";
  }
  a = normalize(a);
  let s = big_integer.string(big_integer.abs(a.coefficient));
  const e = a.exponent + s.length - 1;
  if (s.length > 1) {
    s = s.slice(0, 1) + "." + s.slice(1);
  }
  if (e !== 0) {
    s += "e" + e;
  }
  if (big_integer.is_negative(a.coefficient)) {
    s = "-" + s;
  }
  return s;
}

const EPSILON = make("0.0000000000000000000000000000000000000000000000001");
const ZERO = make("0");
const ONE = make("1");
const TWO = make("2");

function sqrt(n) {
  let x = n;
  let y = ONE;
  while (gt(sub(x, y), EPSILON)) {
    x = div(add(x, y), TWO);
    y = div(n, x);
  }
  return x;
}

function exponentiation(base, exp) {
  if (eq(exp, ZERO)) {
    return ONE;
  }

  if (is_negative(exp)) {
    return div(ONE, exponentiation(base, abs(exp)));
  }

  if (exp.exponent === 0) {
    let result = base;
    let n = 1;
    while (n !== number(exp)) {
      result = mul(result, base);
      n += 1;
    }
    return result;
  }
  if (gt(exp, ONE) || eq(exp, ONE)) {
    const temp = exponentiation(base, div(exp, TWO));
    return mul(temp, temp);
  }
  let low = ZERO;
  let high = ONE;

  let sqr = sqrt(base);
  let acc = sqr;
  let mid = div(high, TWO);

  while (gt(abs(sub(mid, exp)), EPSILON)) {
    sqr = sqrt(sqr);

    if (lt(mid, exp) || eq(mid, exp)) {
      low = mid;
      acc = mul(acc, sqr);
    } else {
      high = mid;
      acc = mul(acc, div(ONE, sqr));
    }
    mid = div(add(low, high), TWO);
  }
  return acc;
}

function evaluate(source, precision = PRECISION) {
  if (typeof source !== "string") {
    throw Error("The first parameter was expected to be a string.");
  }

  // This function relies on an algorithm that fully parenthesizes the expression
  function parenthesize(expr) {
    return (
      "(((("
      + expr
        .replace(/\(/g, "((((")
        .replace(/\)/g, "))))")
        .replace(/(^|[^!])===?/g, ")))==(((")
        .replace(/<=/g, ")))<=(((")
        .replace(/>=/g, ")))>=(((")
        .replace(/<(?!=)/g, ")))<(((")
        .replace(/>(?!=)/g, ")))>(((")
        .replace(/!==?/g, ")))!=(((")
        .replace(/(^|[^e])\+/g, "))+((")
        .replace(/(^|[^e])-(?!\d)/g, "))-((")
        .replace(/\^|\*\*/g, "**")
        .replace(/(^|[^*])\*(?!\*)/g, ")*(")
        .replace(/\//g, ")/(")
        .replace(/%/g, ")%(")
        .replace(/ /g, "")
      + "))))"
    );
  }

  const expression = parenthesize(source);
  const rx_tokens = /(-?\d+(?:\.\d+)?(?:e(-?|\+?)\d+)?)|(\(|\))|(\+|-|\/|\*\*|(^|[^!])==|!=|<=?|>=?|\*|\^|%)/g;
  // Capture groups
  // [1] Number
  // [2] Paren
  // [3] Operator

  function is_number(token) {
    return !Number.isNaN(Number(token));
  }

  // Tokenize the expression
  const tokens = expression.match(rx_tokens).map(function (element) {

    const parens = ["(", ")"];
    const operators = ["+", "-", "*", "**", "/", "%", "==", "!=", "<", ">", "<=", ">="];
    if (element === "%") {
      throw Error("The modulo operator is not supported yet.");
    }
    if (parens.includes(element)) {
      return {
        type: "paren",
        value: element
      };
    } else if (operators.includes(element)) {
      return {
        type: "operator",
        value: element
      };
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
        const operator = ops[1].value;

        const bigfloat_return = {
          "+" () {
            return add(a, b);
          },
          "-" () {
            return sub(a, b);
          },
          "*" () {
            return mul(a, b);
          },
          "/" () {
            return (
              is_zero(b)
                ? ZERO
                : div(a, b, precision)
            );
          },
          "**" () {
            return exponentiation(a, b);
          }
        }[operator];
        const boolean_return = {
          "==" () {
            return eq(a, b);
          },
          "!=" () {
            return !eq(a, b);
          },
          "<" () {
            return lt(a, b);
          },
          ">" () {
            return gt(a, b);
          },
          "<=" () {
            return lt(a, b) || eq(a, b);
          },
          ">=" () {
            return gt(a, b) || eq(a, b);
          }
        }[operator];

        const res = (
          bigfloat_return
            ? {
              type: "number",
              value: bigfloat_return()
            }
            : {
              type: "boolean",
              value: boolean_return()
            }
        );

        return resolve([
          ...start,
          res,
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

module.exports = Object.freeze({
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
  evaluate,
  sqrt,
  exponentiation
});
