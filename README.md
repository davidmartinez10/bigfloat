# bigfloat.js
A library for arbitrary precision decimal floating point arithmetic that can exactly represent all decimal fractions,
unlike JavaScript's number data type which is 64-bit binary floating point.

Based on the original work by Douglas Crockford.
His original implementation made use of a big integer library that was also included in his book How JavaScript Works.
This implementation is built upon the bigint data type that was added to the language, and it runs pretty fast on V8.

Because of this it requires Node >= 10.4.0 or a Chrome >= 67 based browser. Firefox requires a flag to be enabled manually.

Note: This library is a work in progress and shouldn't be used in production.

```javascript
0.1 + 0.2 === 0.3;                     // false
bigfloat.evaluate("0.1 + 0.2 == 0.3"); // true

0.1 + 0.2; // 0.30000000000000004
bigfloat.evaluate("0.1 + 0.2"); // "0.3"

1 + Number.EPSILON; // 1.0000000000000002
bigfloat.evaluate(`1 + ${Number.EPSILON}`) // "1.0000000000000002220446049250313"

1 + Number.EPSILON / 2; // 1
bigfloat.evaluate(`1 + ${Number.EPSILON / 2}`) // "1.00000000000000011102230246251565"
```

This library provides a set of functions for basic operations, and an evaluate() function that makes bigfloat operations behind the scenes. The first operation shown above can also be performed by making use of the other provided functions like this:
```javascript
bigfloat.eq(
  bigfloat.add(
    bigfloat.make("0.1"),
    bigfloat.make("0.2")
  ),
  bigfloat.make("0.3")
); // true
```

- [bigfloat.js](#bigfloatjs)
- [Installation](#installation)
- [The bigfloat object](#the-bigfloat-object)
- [evaluate(expression, precision)](#evaluateexpression-precision)
- [make(number)](#makenumber)
- [string(bigfloat)](#stringbigfloat)
- [add(augend, addend)](#addaugend-addend)
- [sub(minuend, substrahend)](#subminuend-substrahend)
- [mul(multiplicand, multiplier)](#mulmultiplicand-multiplier)
- [div(dividend, divisor, precision)](#divdividend-divisor-precision)

# Installation

```bash
npm install bigfloat.js
```
```javascript
import bigfloat from "bigfloat.js";
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
This function takes an expression in string form, and a negative integer for precision (default is -4) and returns a string:
```javascript
bigfloat.evaluate("10 / 3", -5); // "3.33333"
```

Or a boolean:
```javascript
bigfloat.evaluate("10 / 3 == 3"); // false
```

Caveats:
- The parser relies on a technique that was used in the FORTRAN I compiler that consists in fully parenthesizing the expression before evaluating it, thus exponentiation operators are left-associative like those of MATLAB and Excel. This will be replaced with a Top Down Operator Precedence parser in the near future and this issue will be solved.
-  The exponentiation operator (** or ^) only supports integer exponents as of now, but I plan on expanding the library with more advanced functions.

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

# add(augend, addend)
This function takes two operands and returns the sum.
```javascript
bigfloat.add(
  bigfloat.make(23.632),
  bigfloat.make(65.231)
); // { coefficient: 888629n, exponent: -4 }
```
# sub(minuend, substrahend)
```javascript
bigfloat.sub(
  bigfloat.make(15),
  bigfloat.make(7)
); // { coefficient: 8n, exponent: 0 }
```
# mul(multiplicand, multiplier)
```javascript
bigfloat.mul(
  bigfloat.make(64),
  bigfloat.make(64)
); // { coefficient: 4096n, exponent: 0 }
```
# div(dividend, divisor, precision)
```javascript
bigfloat.div(
  bigfloat.make(40),
  bigfloat.make(17),
  -4
); // { coefficient: 23529n, exponent: -4 }
```
