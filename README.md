# spacewar-wasm4

A port of the historic game Spacewar to AssemblyScript for the [WASM-4](https://wasm4.org) fantasy console.

Literally just https://spacewar.oversigma.com/ made to run in WASM-4.

## Credits

Spacewar! was conceived in 1961 by Martin Graetz, Stephen Russell, and
Wayne Wiitanen. It was first realized on the PDP-1 in 1962 by Stephen
Russell, Peter Samson, Dan Edwards, and Martin Graetz, together with
Alan Kotok, Steve Piner, and Robert A Saunders. Spacewar! is in the
public domain, but this credit paragraph must accompany all distributed
versions of the program.

PDP-1 emulator in Javascript by Barry Silverman, Brian Silverman, and Vadim Gerasimov copied from https://spacewar.oversigma.com/

## Building

First setup the project by running:

```shell
npm install
```

Build the cart by running:

```shell
npm run build
```

Then run it with:

```shell
w4 run build/cart.wasm
```

For more info about setting up WASM-4, see the [quickstart guide](https://wasm4.org/docs/getting-started/setup?code-lang=assemblyscript#quickstart).

## Links

- [Documentation](https://wasm4.org/docs): Learn more about WASM-4.
- [Snake Tutorial](https://wasm4.org/docs/tutorials/snake/goal): Learn how to build a complete game
  with a step-by-step tutorial.
- [GitHub](https://github.com/aduros/wasm4): Submit an issue or PR. Contributions are welcome!
