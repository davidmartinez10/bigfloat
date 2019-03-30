/*global BigInt*/
import JSBI from "jsbi";

const bigint_support = typeof BigInt === "function";

function native() {
  function is_big_integer(big) {
    return typeof big === "bigint";
  }

  function is_negative(big) {
    return big < BigInt(0);
  }

  function is_positive(big) {
    return big >= BigInt(0);
  }

  function is_zero(big) {
    return big === BigInt(0);
  }

  function make(n) {
    return BigInt(n);
  }

  const negative_one = make(-1);
  const zero = make(0);
  const one = make(1);
  const two = make(2);
  const ten = make(10);

  function number(bigint) {
    return Number(bigint);
  }

  function neg(big) {
    return -big;
  }

  function mul(a, b) {
    return a * b;
  }

  function power(a, b) {
    if (b < BigInt(0)) {
      return undefined;
    }
    return a ** b;
  }

  function add(a, b) {
    return a + b;
  }

  function sub(a, b) {
    return a - b;
  }

  function divrem(a, b) {
    return [a / b, a % b];
  }

  function abs(big) {
    return (
      is_zero(big)
        ? zero
        : (
          is_negative(big)
            ? neg(big)
            : big
        )
    );
  }

  function signum(big) {
    return (
      is_zero(big)
        ? zero
        : (
          is_negative(big)
            ? negative_one
            : one
        )
    );
  }

  function abs_lt(a, b) {
    return abs(a) < abs(b);
  }

  function string(big) {
    return String(big);
  }

  return {
    abs,
    abs_lt,
    add,
    divrem,
    is_big_integer,
    is_negative,
    is_positive,
    is_zero,
    make,
    mul,
    neg,
    number,
    power,
    signum,
    string,
    sub,
    ten,
    one,
    two,
    zero
  };
}

function jsbi() {
  function is_big_integer(big) {
    return Array.isArray(big) && typeof big.sign === "boolean";
  }

  function is_negative(big) {
    return Array.isArray(big) && big.sign === true;
  }

  function is_positive(big) {
    return Array.isArray(big) && big.sign === false;
  }

  function is_zero(big) {
    return !Array.isArray(big) || big.length < 1;
  }

  function make(n) {
    return JSBI.BigInt(n);
  }

  const negative_one = make(-1);
  const zero = make(0);
  const one = make(1);
  const two = make(2);
  const ten = make(10);

  function number(bigint) {
    return JSBI.toNumber(bigint);
  }

  function neg(big) {
    return JSBI.unaryMinus(big);
  }

  function mul(a, b) {
    return JSBI.multiply(a, b);
  }

  function power(a, b) {
    return JSBI.exponentiate(a, b);
  }

  function add(a, b) {
    return JSBI.add(a, b);
  }

  function sub(a, b) {
    return JSBI.subtract(a, b);
  }

  function divrem(a, b) {
    return [JSBI.divide(a, b), JSBI.remainder(a, b)];
  }

  function abs(big) {
    return (
      is_zero(big)
        ? zero
        : (
          is_negative(big)
            ? neg(big)
            : big
        )
    );
  }

  function signum(big) {
    return (
      is_zero(big)
        ? zero
        : (
          is_negative(big)
            ? negative_one
            : one
        )
    );
  }

  function abs_lt(a, b) {
    return JSBI.lessThan(abs(a), abs(b));
  }

  function string(big) {
    return big.toString();
  }

  return {
    abs,
    abs_lt,
    add,
    divrem,
    is_big_integer,
    is_negative,
    is_positive,
    is_zero,
    make,
    mul,
    neg,
    number,
    power,
    signum,
    string,
    sub,
    ten,
    one,
    two,
    zero
  };
}

export default (
  bigint_support
    ? native()
    : jsbi()
);
