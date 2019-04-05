import big_float from "./index.mjs";

const rx_token = /(\u0020+)|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|(\(|\)|\+|-|\/|\*\*|==|!=|<=?|>=?|\*|\^|%)/y;

//. Capture Group
//.     [1]  Space
//.     [2]  Number
//.     [3]  Punctuator

function tokenize(source) {

  rx_token.lastIndex = 0;

  return function token_generator() {
    const column_nr = rx_token.lastIndex;
    const captives = rx_token.exec(source);

    // Nothing matched.
    if (!captives) {
      return {
        id: "(error)",
        column_nr,
        string: source.slice(column_nr)
      };
    }

    if (captives[1]) {
      return token_generator();
    }

    // A number literal matched.

    if (captives[2]) {
      return {
        id: "(number)",
        readonly: true,
        number: big_float.make(captives[2]),
        text: captives[2],
        column_nr,
        column_to: rx_token.lastIndex
      };
    }

    // A punctuator matched.

    if (captives[4]) {
      return {
        id: captives[4],
        column_nr,
        column_to: rx_token.lastIndex
      };
    }
  };
}


export default Object.freeze(tokenize);
