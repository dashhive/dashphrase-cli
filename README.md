# DashPhrase CLI

A _Recovery Phrase_ generator for Mac, Linux, &amp; Windows \
(BIP-39 "mnemonic" compliant)

> Production-ready reference implementation built with DASH SDK Core.

```sh
dashphrase generate -o ./words.txt
```

```text
cat swing flag economy stadium alone churn speed unique patch report train
```

```sh
dashphrase seed ./words.txt "" -o ./seed.hex
```

```text
7ea73b3a398f8a71f7dde589d972b0358d3fa8b9e91317ecc544e42752b1bb251a1926b1f4c69eec0a80c0396aa0f7df29f7d73411d3106eba539f3d584fcdf8
```

Use for anything that needs entropy that can be communicated over the phone, \
or printed and stored in a safe place.

(this is what a cryptocurrency "Wallet" is, by the way - just 12 words)

_Developed for (but not specific to) DASH._

# Table of Contents

- Install
- Usage
  - `help`
- Test Values
  - Zoomonic (easy-to-remember)
  - Catmonic (pleasant, looks random)
- JavaScript SDK
- License

# Install

1. Install [node.js](https://webinstall.dev/node)

   ```sh
   # Mac, Linux
   curl -sS https://webi.sh/node | sh
   source ~/.config/envman/PATH.env
   ```

   ```sh
   # Windows
   curl.exe https://webi.ms/node | powershell
   ```

2. Install `dashphrase-cli`
   ```sh
   npm install --location=global dashphrase-cli@1
   ```
3. Use the `dashphrase` command to generate recovery phrases (mnemonics)

   ```text
   dashphrase generate -o ./words.txt
   ```

# Usage

You can generate a recovery phrase

```sh
dashphrase generate [-o ./words.txt]
```

And convert it into a seed (e.g. for _DashHD_ or _DashWallet_)

```sh
dashphrase seed <./words.txt> <./secret.txt> [-o ./seed.hex]
```

## Help

See the latest help:

```sh
dashphrase help
```

It's probably still pretty close to this:

```text
dashphrase-cli v1.0.0 SDK v1.3.5

USAGE:
    dashphrase <subcommand> [...]

EXAMPLES:
    dashphrase gen --bits 128 -o ./words.txt
    dashphrase decode ./words.txt -o ./entropy.hex
    dashphrase encode ./entropy.hex -o ./words.txt
    dashphrase seed ./words.txt "" -o ./seed.hex

SUBCOMMANDS:
    gen|generate [--bits 128] [-o ./words.txt]
    decode                    <./words.txt> [-o ./entropy.hex]
    encode                    <./entropy.hex> [-o ./words.txt]
    seed        [--no-verify] <./words.txt> <./secret.txt> [-o seed.hex]
    zoomonic                  [secret-salt]   prints zoomonic & seed
    catmonic                  [secret-salt]   prints catmonic & seed

    help
    version

TEST VALUES:

    Catmonic:
      cat swing flag economy stadium alone churn speed unique patch report train

    Zoomonic: zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo wrong
    Zecret:   TREZOR
    Zeed:
      ac27495480225222079d7be181583751e86f571027b0497b5b5d11218e0a8a13332572917f0f8e5a589620c6f15b11c61dee327651a14c34e18231052e48c069
```

# Test Values

These are values for use in documentation, examples, test fixtures, debugging,
etc

## Zoomonic

Words:

```text
zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo wrong
```

<small>(easy to remember because it's a zoo, and the checksum is wrong)</small>

Seed (Zeed), using "TREZOR" as secret salt:

```text
ac27495480225222079d7be181583751e86f571027b0497b5b5d11218e0a8a13332572917f0f8e5a589620c6f15b11c61dee327651a14c34e18231052e48c069
```

## Catmonic

Words:

```text
cat swing flag economy stadium alone churn speed unique patch report train
```

Catmonic Seed, with empty (`""`) secret salt:

```text
7ea73b3a398f8a71f7dde589d972b0358d3fa8b9e91317ecc544e42752b1bb251a1926b1f4c69eec0a80c0396aa0f7df29f7d73411d3106eba539f3d584fcdf8
```

# DashPhrase JavaScript SDK

DashPhrase CLI was created to make it easier for developers to get involved in
developing apps for themselves and online merchants using DASH.

It is part of the DASH SDK Core, which is a suite of ready-for-production-use
reference implementations in JavaScript.

- [Dash Tools: DASH SDK Core][dash-sdk-core]
  - [Secp256k1.js][secp256k1-js]
  - [DashKeys.js][dashkeys-js]
  - [**DashPhrase.js**][dashphrase-js]
  - [DashHD.js][dashhd-js]

[dash-sdk-core]: https://github.com/dashhive/dash-tools
[secp256k1-js]: https://github.com/dashhive/Secp256k1.js
[dashkeys-js]: https://github.com/dashhive/DashKeys.js
[dashphrase-js]: https://github.com/dashhive/DashPhrase.js
[dashhd-js]: https://github.com/dashhive/DashHD.js

# License

MIT License

Copyright (c) 2023 AJ ONeal \
Copyright (c) 2023 Dash Incubator
