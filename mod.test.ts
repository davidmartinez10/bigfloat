/// <reference lib="deno.ns" />
import {assertEquals} from "jsr:@std/assert";

import {BigFloat} from "./mod.ts";

Deno.test("evaluate", function() {
  assertEquals(BigFloat.evaluate("4.333 ** 3 * 3.14 - 70", 18),
               "185.44400527618");
});

Deno
  .test("decimalPlaces",
        function() { assertEquals(new BigFloat("4.333").decimalPlaces(), 3); });

Deno
  .test("isInteger",
        function() { assertEquals(new BigFloat("4.333").isInteger(), false); });

Deno.test(
  "isNegative",
  function() { assertEquals(new BigFloat("-4.333").isNegative(), true); });

Deno
  .test("isPositive",
        function() { assertEquals(new BigFloat("4.333").isPositive(), true); });

Deno.test("isZero",
          function() { assertEquals(new BigFloat("0").isZero(), true); });

Deno.test("eq", function() {
  assertEquals(new BigFloat("4.333").eq(new BigFloat("4.333")), true);
  assertEquals(new BigFloat("4.333").eq(new BigFloat("4.332")), false);
});

Deno.test("gt", function() {
  assertEquals(new BigFloat("4.333").gt(new BigFloat("1")), true);
  assertEquals(new BigFloat("4.333").gt(new BigFloat("4.333")), false);
});

Deno.test("gte", function() {
  assertEquals(new BigFloat("4.333").gte(new BigFloat("1")), true);
  assertEquals(new BigFloat("4.333").gte(new BigFloat("4.333")), true);
});

Deno.test("lt", function() {
  assertEquals(new BigFloat("4.333").lt(new BigFloat("1")), false);
  assertEquals(new BigFloat("4.331").lt(new BigFloat("4.333")), true);
});

Deno.test("lte", function() {
  assertEquals(new BigFloat("4.333").lte(new BigFloat("1")), false);
  assertEquals(new BigFloat("4.333").lte(new BigFloat("4.333")), true);
});

Deno.test("abs", function() {
  assertEquals(new BigFloat("-4.333").abs().toString(), "4.333");
});

Deno.test("neg", function() {
  assertEquals(new BigFloat("4.333").neg().toString(), "-4.333");
});

Deno.test(
  "sqrt",
  function() { assertEquals(new BigFloat(2).sqrt().toString(), "1.4142"); });

Deno.test("div", function() {
  assertEquals(new BigFloat("43.33").div(4).toString(), "10.8325");
  assertEquals(new BigFloat("4.333").div(new BigFloat("2")).toString(),
               "2.1665");
});

Deno.test("minus", function() {
  assertEquals(new BigFloat("4.333").minus(new BigFloat("2")).toString(),
               "2.333")
});

Deno.test("plus", function() {
  assertEquals(new BigFloat("4.333").plus(new BigFloat("2")).toString(),
               "6.333")
});

Deno.test("mul", function() {
  assertEquals(new BigFloat("4.333").mul(new BigFloat("2")).toString(),
               "8.666");
});

Deno.test("exponentiation", function() {
  assertEquals(new BigFloat("4.333").toPower(2).toString(), "18.774889");
});

Deno.test(
  "ceil",
  function() { assertEquals(new BigFloat("4.333").ceil().toString(), "5"); });

Deno.test(
  "floor",
  function() { assertEquals(new BigFloat("4.333").floor().toString(), "4"); });

Deno.test("modulo", function() {
  assertEquals(String(73 % 32), new BigFloat(73).modulo(32).toString());
})

Deno.test(
  "toString",
  function() { assertEquals(new BigFloat("4.333").toString(), "4.333"); });

Deno.test("valueOf", function() {
  assertEquals(new BigFloat("4.333").valueOf(),
               { coefficient: 4333n, exponent: -3 });
});
