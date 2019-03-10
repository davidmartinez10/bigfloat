# bigfloat.js
A library for arbitrary precision floating point arithmetic, based on the original work by Douglas Crockford.

Note: This library is a work in progress and shouldn't be used in production.

```javascript
0.1 + 0.2 === 0.3                     // false

import bigfloat from "bigfloat.js";
bigfloat.evaluate("0.1 + 0.2 == 0.3") // true
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

- [evaluate(expression, precision)](#evaluateexpression-precision)
- [add()](#add)
- [sub()](#sub)
- [mul()](#mul)
- [div()](#div)
  
# evaluate(expression, precision)
This function takes an expression in string form, and a precision argument (default is -4) and returns a string:
```javascript
bigfloat.evaluate("10 / 3", -5) // 3.33334
```

Or a boolean:
```javascript
bigfloat.evaluate("10 / 3 == 3") // false
```

Caveats:
- The parser relies on a technique that was used in the FORTRAN I compiler that consists in fully parenthesizing the expression before evaluating it, thus exponentiation operators are left-associative like those of MATLAB and Excel. This will be replaced with a Top Down Operator Precedence parser in the near future and this issue will be solved.
-  The exponentiation operator (** or ^) only supports integer exponents as of now, but I plan on expanding the library with more advanced functions.

# add()
# sub()
# mul()
# div()
