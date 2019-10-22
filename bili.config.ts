import { Config } from "bili";

const config: Config = {
  input: "src/mod.ts",
  output: {
    dir: "lib",
    format: [
      "cjs-min",
      "es-min",
      "esm-min",
      "umd-min",
      "iife-min",
      "amd-min",
      "system-min",
      "cjs",
      "es",
      "esm",
    ],
    moduleName: "bigfloat"
  },
  plugins: {
    typescript2: {
      // Override the config in `tsconfig.json`
      tsconfigOverride: {
        include: ["src"]
      }
    }
  }
};

export default config;
