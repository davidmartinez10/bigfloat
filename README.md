# bigfloat.js
A library for arbitrary precision floating point arithmetic, based on the original work by Douglas Crockford.

Note: This library is a work in progress and shouldn't be used in production.

```javascript
0.1 + 0.2 === 0.3;                     // false

bigfloat.evaluate("0.1 + 0.2 == 0.3"); // true
```

This library provides a set of functions for basic operations, and an evaluate() function that makes bigfloat operations behind the scenes. The operation shown above can also be performed by making use of the other provided functions like this:
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
  bigfloat.make(17)
); // { coefficient: 23529n, exponent: -4 }
```
