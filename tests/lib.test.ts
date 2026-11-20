/// <reference lib="deno.ns" />
import {assertEquals} from "@std/assert";

import {gt, make, scientific} from "../src/lib.ts";

Deno.test("scientific",
          function() { assertEquals(scientific(make(8000000)), "8e6"); });

Deno.test("make",
          function() { assertEquals(gt(make(4000), make("1e+21")), false); });
