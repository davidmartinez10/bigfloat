/// <reference lib="deno.ns" />
import {assertEquals} from "@std/assert";

import {make, scientific} from "../src/lib.ts";

Deno.test("scientific",
          function() { assertEquals(scientific(make(8000000)), "8e6"); });
