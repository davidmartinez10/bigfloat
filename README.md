# bigfloat.js
A library for arbitrary precision decimal floating point arithmetic that can exactly represent all decimal fractions,
unlike JavaScript's number data type which is 64-bit binary floating point.

Based on the original work by Douglas Crockford.
This implementation is built upon the bigint data type that was added to the language, and it runs pretty fast on V8.
For Node versions lower than 10.4.0 it falls back to Google Chrome Labs' implementation of ECMAScript big integers: JSBI.
Node >= 7.0.0 is required.

```javascript
import bigfloat from "bigfloat.js";

0.1 + 0.2 === 0.3;                     // false
bigfloat.evaluate("0.1 + 0.2 == 0.3"); // true

0.1 + 0.2;                      // 0.30000000000000004
bigfloat.evaluate("0.1 + 0.2"); // "0.3"

1 + Number.EPSILON / 2;                         // 1
bigfloat.evaluate(`1 + ${Number.EPSILON / 2}`); // "1.00000000000000011102230246251565"

2 ** 2 ** 2 ** 2 ** 2;                      // Infinity
bigfloat.evaluate("2 ** 2 ** 2 ** 2 ** 2"); // "2003529930406846464979072351560255750447825475569751...(More than 19 thousand digits)
```

It also understands scientific e-notation:
```javascript
bigfloat.evaluate("1 + 2.220446049250313e-16"); // "1.0000000000000002220446049250313"
```
This library provides a set of functions for basic operations, and an evaluate() function that makes bigfloat operations behind the scenes. The first operation shown above can also be performed by making use of the other provided functions like this:
```javascript
const { eq, add, make } = bigfloat;
eq(
  add(make("0.1"), make("0.2")),
  make("0.3")
); // true
```
- [bigfloat.js](#bigfloatjs)
- [Installation](#installation)
- [The bigfloat object](#the-bigfloat-object)
- [evaluate(expression, precision)](#evaluateexpression-precision)
- [make(number)](#makenumber)
- [string(bigfloat)](#stringbigfloat)
- [Other useful functions](#other-useful-functions)
- [Changelog](#changelog)

# Installation
```bash
npm install bigfloat.js --save
```

# The bigfloat object
```javascript
{
  coefficient: 522299n,
  exponent: -4
}
```
The coefficient is a bigint that contains all of the digits that make up the number.
The exponent is a number that indicates where to place the decimal point.
This bigfloat object represents the decimal value 52.2299

# evaluate(expression, precision)
This function takes an expression in string form, and a negative integer for precision (default is -24) and returns a string:
```javascript
bigfloat.evaluate("10 / 3", -5); // "3.33333"
```

Or a boolean:
```javascript
bigfloat.evaluate(`4 >= ${Math.PI}`); // true
```

The tokens that make up the expression can be:
- Parenthesis: (,)
- Number: Decimal form or scientific e-notation
- Operator: Arithmetic +,-,/,*,** Relational ===,==,!==,!=,<,>,<=,>=


It would be nice to have a transpiler that replaces JavaScript numbers and operators for bigfloat function calls, but it seemed to me very convenient to have this functionality available at runtime.

# make(number)
This function takes a number in a string or number form and returns a bigfloat object.
```javascript
bigfloat.make(53.23);   // { coefficient: 522299n, exponent: -4 }
bigfloat.make("12000"); // { coefficient: 12000n, exponent: 0 }
```

# string(bigfloat)
This function takes a bigfloat object and returns a string containing the decimal representation of the number. The conversion is exact.
```javascript
bigfloat.string({ coefficient: 522299n, exponent: -4 }); // "53.23"
```

# Other useful functions
- add(augend, addend)
- sub(minuend, substrahend)
- mul(multiplicand, multiplier)
- div(dividend, divisor, precision)
- exponentiation(base, exponent)
- eq(comparahend, comparator)
- lt(comparahend, comparator)
- gt(comparahend, comparator)
- sqrt(n)
- abs(n)
- fraction(n)
- integer(n)
- is_big_float(n)
- is_negative(n)
- is_positive(n)
- is_zero(n)
- neg(n)
- normalize(n)
- number(n)
- scientific(n)


# Changelog
1.1.8
- Exponentiation operators(^, **) are now right-associative.

1.1.9
- Added a sqrt() function.

1.1.10
- Added an exponentiation() function.
- Exponentiation operations now support non-integer exponents.

1.2.0
- Added support for Node >= 7.0.0 and most web browsers.