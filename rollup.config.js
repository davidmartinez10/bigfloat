import babel from "rollup-plugin-babel";
import commonjs from "rollup-plugin-commonjs";
import { uglify } from "rollup-plugin-uglify";

export default {
    input: "lib/mod.js",
    output: [
        {
            name: "bigfloat",
            file: "lib/bigfloat.min.js",
            format: "umd"
        }
    ],
    plugins: [babel(), commonjs(), uglify()],
};
