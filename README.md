# bigfloat.js
A library for arbitrary precision decimal floating point arithmetic that can exactly represent all decimal fractions,
unlike JavaScript's number data type which is 64-bit binary floating point.

Based on the original work by Douglas Crockford.
This implementation is built upon the Google Chrome Labs' implementation of ECMAScript big integers: JSBI.

```javascript
0.1 + 0.2 === 0.3;                     // false
bigfloat.evaluate("0.1 + 0.2 == 0.3"); // true

0.1 + 0.2;                      // 0.30000000000000004
bigfloat.evaluate("0.1 + 0.2"); // "0.3"

1 + Number.EPSILON / 2;                         // 1
bigfloat.evaluate(`1 + ${Number.EPSILON / 2}`); // "1.00000000000000011102230246251565"
```

It also understands scientific e-notation:
```javascript
bigfloat.evaluate("1 + 2.220446049250313e-16"); // "1.0000000000000002220446049250313"
```

This library provides a set of functions for basic operations, and an evaluate() function that makes bigfloat operations behind the scenes. The first operation shown above can also be performed by making use of the other provided functions like this:
```javascript
const { eq, add, BigFloat } = bigfloat;
eq(
  add(BigFloat("0.1"), BigFloat("0.2")),
  BigFloat("0.3")
); // true
```

You can also use the familiar Decimal.js API (partial implementation as of now):
```javascript
import { Decimal } from "bigfloat.js";

new Decimal("2").sqrt().toString() // "1.4142"
```
- [bigfloat.js](#bigfloatjs)
- [Installation](#installation)
- [Importing the bigfloat module](#importing-the-bigfloat-module)
- [The bigfloat object](#the-bigfloat-object)
- [Change precision](#change-precision)
- [evaluate(expression, precision)](#evaluateexpression-precision)
- [bigfloat(number) / make(number)](#makenumber)
- [string(bigfloat)](#stringbigfloat)
- [Other useful functions](#other-useful-functions)
- [Changelog](#changelog)

# Installation
```bash
npm install bigfloat.js --save
```

# Importing the bigfloat module
CommonJS:
```javascript
const bigfloat = require("bigfloat.js").default;
const { Decimal } = require("bigfloat.js"); 
```

ESModules or TS:
```javascript
import bigfloat, { Decimal } from "bigfloat.js";
```

# The bigfloat object
```typescript
interface BigFloat {
  coefficient: JSBI;
  exponent: number;
}
```
```javascript
{
  coefficient: BigInt(522299),
  exponent: -4
}
```
The coefficient is a bigint that contains all of the digits that make up the number.
The exponent is a number that indicates where to place the decimal point.
This bigfloat object represents the decimal value 52.2299

# Change precision
This function only takes negative integers. The default precision is -4.
```typescript
bigfloat.string(bigfloat.sqrt(BigFloat("2"))); // 1.4142
bigfloat.set_precision(-10);
bigfloat.string(bigfloat.sqrt(BigFloat("2"))); // 1.4142135623
``` 
```typescript
new Decimal(2).sqrt().toString(); // 1.4142
new Decimal(2).setPrecision(-10);
new Decimal(2).sqrt().toString(); // 1.4142135623
``` 

# evaluate(expression, precision)
This function takes an expression in string form, and a negative integer for precision (default is -4) and returns a string:
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

# BigFloat(number) / make(number)
This function takes a number in a string or number form and returns a bigfloat object.
```javascript
BigFloat(53.23);   // { coefficient: BigInt(5323), exponent: -2 }
make("12000"); // { coefficient: BigInt(12000), exponent: 0 }
```

# string(bigfloat)
This function takes a bigfloat object and returns a string containing the decimal representation of the number. The conversion is exact.
```javascript
bigfloat.string({ coefficient: BigInt(5323), exponent: -2 }); // "53.23"
```

# Changelog
2.0.2
- Edit README.MD
- Change build process

2.0.1
- Add bundler for unpkg.

2.0.0
- TS rewrite.
- Added an exported Decimal class.
- Improved browser and legacy Node.js versions compatibility.

1.1.8
- Exponentiation operators(^, **) are now right-associative.

1.1.9
- Added a sqrt() function.

1.1.10
- Added an exponentiation() function.
- Exponentiation operations now support non-integer exponents.

1.2.0
- Added support for Node >= 7.0.0 and most web browsers.