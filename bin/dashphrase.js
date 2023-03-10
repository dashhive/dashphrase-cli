#!/usr/bin/env node
"use strict";

//@ts-ignore
let pkg = require("../package.json");
//@ts-ignore
let sdkPkg = require("dashphrase/package.json");

let Fs = require("node:fs/promises");

let DashPhrase = require("dashphrase");
//let DashPhrase = require("../../dashphrase.js");

function printVersion() {
  console.info(`${pkg.name} v${pkg.version} SDK v${sdkPkg.version}`);
}

function printHelp() {
  printVersion();
  console.error();
  console.error("USAGE:");
  console.error("    dashphrase <subcommand> [...]");
  console.error();
  console.error("EXAMPLES:");
  console.error("    dashphrase gen --bits 128 -o ./words.txt");
  console.error("    dashphrase decode ./words.txt -o ./entropy.hex");
  console.error("    dashphrase encode ./entropy.hex -o ./words.txt");
  console.error('    dashphrase seed ./words.txt "" -o ./seed.hex');
  console.error();
  console.error("SUBCOMMANDS:");
  /*
    Object.keys(sdkPkg.bin).forEach(function (cmd) {
      // remove 'dashphrase-' prefix
      let sub = cmd.slice("dashphrase-".length);
      console.error(`    ${sub}`);
    });
  */
  console.error(`    gen|generate [--bits 128] [-o ./words.txt]`);
  console.error(
    "    decode                    <./words.txt> [-o ./entropy.hex]",
  );
  console.error(
    "    encode                    <./entropy.hex> [-o ./words.txt]",
  );
  console.error(
    `    seed        [--no-verify] <./words.txt> <./secret.txt> [-o seed.hex]`,
  );
  console.error(
    `    zoomonic                  [secret-salt]   prints zoomonic & seed`,
  );
  console.error(
    `    catmonic                  [secret-salt]   prints catmonic & seed`,
  );
  console.error();
  console.error(`    help`);
  console.error(`    version`);
  console.error();
  console.error("TEST VALUES:");
  console.error();
  console.error("    Catmonic:");
  console.error("     ", DashPhrase.CATMONIC);
  console.error();
  console.error("    Zoomonic:", DashPhrase.ZOOMONIC);
  console.error("    Zecret:  ", DashPhrase.ZECRET);
  console.error("    Zeed:    ");
  console.error("     ", DashPhrase.ZEED);
  console.error();
}

/** @param {Uint8Array} bytes */
function toHex(bytes) {
  let hs = [];
  for (let b of bytes) {
    let h = b.toString(16);
    h = h.padStart(2, "0");
    hs.push(h);
  }
  return hs.join("");
}

/** @param {String} hex */
function toBytes(hex) {
  let len = hex.length / 2;
  let bytes = new Uint8Array(len);

  let index = 0;
  for (let i = 0; i < hex.length; i += 2) {
    let c = hex.slice(i, i + 2);
    let b = parseInt(c, 16);
    bytes[index] = b;
    index += 1;
  }

  return bytes;
}

async function generate(args) {
  let bits = 128;
  let bitsOpt = removeOption(args, ["--bits"]);
  if (bitsOpt) {
    bits = parseInt(bitsOpt, 10);
  }
  let force = removeFlag(args, ["--force"]);

  let words = await DashPhrase.generate(bits);

  let wordsFile = removeOption(args, ["-o"]);
  if (!wordsFile) {
    console.info(`${words}`);
    return;
  }

  let exists = await fileExists(wordsFile);
  if (exists) {
    if (!force) {
      console.error(`Error: '${wordsFile}' exists. --force to overwrite`);
      process.exit(1);
      return;
    }
  }

  await Fs.writeFile(wordsFile, `${words}\n`, "ascii");
  console.info(`Saved new Recovery Phrase to '${wordsFile}'.`);
}

async function fileExists(filepath) {
  let doesntExist = await Fs.access(filepath).catch(function (err) {
    if ("ENOENT" !== err.code) {
      throw err;
    }
    return true;
  });
  return !doesntExist;
}

async function seed(args) {
  // seed [--skip-verify] <./words.txt> <./secret.txt> [./seed.hex]`);
  let noVerify = removeFlag(args, ["--no-verify"]);
  let force = removeFlag(args, ["--force"]);

  let wordsFile = removeArg(args);
  if (!wordsFile) {
    printHelp();
    process.exit(1);
    return;
  }
  let words = await Fs.readFile(wordsFile, "ascii");
  words = words.trim();

  let secretFile = removeArg(args);
  if (null === secretFile) {
    printHelp();
    process.exit(1);
    return;
  }

  let secret = "";
  if (secretFile) {
    secret = await Fs.readFile(secretFile, "ascii");
    secret = secret.trim();
  }

  let seed = await DashPhrase.toSeed(words, secret, { verify: !noVerify });
  let seedHex = toHex(seed);

  let seedFile = removeOption(args, ["-o"]);
  if (!seedFile) {
    console.info(`${seedHex}`);
    return;
  }

  let exists = await fileExists(seedFile);
  if (exists) {
    let existing = await Fs.readFile(seedFile, "ascii");
    existing = existing.trim();
    if (seedHex === existing) {
      console.info(`Seed already exists in '${seedFile}'.`);
      return;
    }

    if (!force) {
      console.error(`Error: '${seedFile}' exists. --force to overwrite`);
      process.exit(1);
      return;
    }
  }

  await Fs.writeFile(seedFile, `${seedHex}\n`, "ascii");
  console.info(`Saved Seed to '${seedFile}'.`);
}

async function decode(args) {
  let force = removeFlag(args, ["--force"]);

  let wordsFile = removeArg(args);
  if (!wordsFile) {
    printHelp();
    process.exit(1);
    return;
  }
  let words = await Fs.readFile(wordsFile, "ascii");
  words = words.trim();

  let entropyBytes;
  try {
    entropyBytes = await DashPhrase.decode(words);
  } catch (e) {
    if ("E_UNKNOWN_WORD" === e.code) {
      console.error(`Error: ${e.message}`);
      process.exit(1);
      return;
    }
    if ("E_BAD_CHECKSUM" === e.code) {
      console.error(`Error: ${e.message}`);
      entropyBytes = await DashPhrase.decode(words, { verify: false });
    }
    throw e;
  }

  let entropyHex = toHex(entropyBytes);
  let entropyFile = removeOption(args, ["-o"]);
  if (!entropyFile) {
    console.info(`${entropyHex}`);
    return;
  }

  let exists = await fileExists(entropyFile);
  if (exists) {
    let existing = await Fs.readFile(entropyFile, "ascii");
    existing = existing.trim();
    if (entropyHex === existing) {
      console.info(`Entropy already exists in '${entropyFile}'.`);
      return;
    }

    if (!force) {
      console.error(`Error: '${entropyFile}' exists. --force to overwrite`);
      process.exit(1);
      return;
    }
  }

  await Fs.writeFile(entropyFile, `${entropyHex}\n`, "ascii");
  console.info(`Saved Hex-encoded Entropy to '${entropyFile}'.`);
}

async function encode(args) {
  let force = removeFlag(args, ["--force"]);

  let entropyFile = removeArg(args);
  if (!entropyFile) {
    printHelp();
    process.exit(1);
    return;
  }
  let entropyHex = await Fs.readFile(entropyFile, "ascii");
  entropyHex = entropyHex.trim();

  let entropy = toBytes(entropyHex);
  let words = await DashPhrase.encode(entropy);

  let wordsFile = removeOption(args, ["-o"]);
  if (!wordsFile) {
    console.info(`${words}`);
    return;
  }

  let exists = await fileExists(wordsFile);
  if (exists) {
    let existing = await Fs.readFile(wordsFile, "ascii");
    existing = existing.trim();
    if (words === existing) {
      console.info(`Recovery Phrase already exists in '${wordsFile}'.`);
      return;
    }

    if (!force) {
      console.error(`Error: '${wordsFile}' exists. --force to overwrite`);
      process.exit(1);
      return;
    }
  }

  await Fs.writeFile(wordsFile, `${words}\n`, "ascii");
  console.info(`Saved encoded Recovery Phrase to '${wordsFile}'.`);
}

async function catmonic(args) {
  let secret = removeArg(args);
  if (null === secret) {
    secret = DashPhrase.ZECRET;
  }
  console.error(`Catmonic:`);
  console.error(`    ${DashPhrase.CATMONIC}`);
  console.error();

  if (secret === DashPhrase.ZECRET) {
    console.error(`Zecret:   "${DashPhrase.ZECRET}"`);
  } else {
    console.error(`Secret:   "${secret}"`);
  }
  console.error("");

  let seed = await DashPhrase.toSeed(DashPhrase.CATMONIC, secret);
  let seedHex = toHex(seed);

  console.error("");
  process.stderr.write("Seed:\n    ");
  console.info(`${seedHex}`);
  console.error("");
}

async function zoomonic(args) {
  let secret = removeArg(args);
  if (null === secret) {
    secret = DashPhrase.ZECRET;
  }
  console.error(`Zoomonic:`);
  console.error(`    ${DashPhrase.ZOOMONIC}`);
  console.error();

  if (secret === DashPhrase.ZECRET) {
    console.error(`Zecret:   "${DashPhrase.ZECRET}"`);
  } else {
    console.error(`Secret:   "${secret}"`);
  }
  console.error();

  let seed = await DashPhrase.toSeed(DashPhrase.ZOOMONIC, secret);
  let seedHex = toHex(seed);

  console.error("");
  process.stderr.write("Seed:\n    ");
  console.info(`${seedHex}`);
  console.error("");
}

async function main() {
  let args = process.argv.slice(2);

  let isHelp = !args.length || removeFlag(args, ["help", "--help"]);
  if (isHelp) {
    printHelp();
    let isClean = !!args.length;
    if (isClean) {
      process.exit(0);
    }
    process.exit(1);
    return;
  }

  let isVersion = removeFlag(args, ["version", "-V", "--version"]);
  if (isVersion) {
    printVersion();
    process.exit(0);
    return;
  }

  let isGenerate = removeFlag(args, ["gen", "generate"]);
  if (isGenerate) {
    await generate(args);
    process.exit(0);
    return;
  }

  let isSeed = removeFlag(args, ["seed"]);
  if (isSeed) {
    await seed(args);
    process.exit(0);
    return;
  }

  let isDecode = removeFlag(args, ["decode"]);
  if (isDecode) {
    await decode(args);
    process.exit(0);
    return;
  }

  let isEncode = removeFlag(args, ["encode"]);
  if (isEncode) {
    await encode(args);
    process.exit(0);
    return;
  }

  let isZoomonic = removeFlag(args, ["zoomonic"]);
  if (isZoomonic) {
    await zoomonic(args);
    process.exit(0);
    return;
  }

  let isCatmonic = removeFlag(args, ["catmonic"]);
  if (isCatmonic) {
    await catmonic(args);
    process.exit(0);
    return;
  }

  printHelp();
  process.exit(1);
}

/**
 * @param {Array<String>} args
 * @param {Array<String>} [aliases]
 */
function removeArg(args, aliases) {
  if (aliases) {
    let arg = removeFlag(args, aliases);
    return arg;
  }
  let arg = args.shift();
  if (undefined === arg) {
    return null;
  }
  return arg;
}

/**
 * @param {Array<String>} arr
 * @param {Array<String>} aliases
 * @returns {String?}
 */
function removeFlag(arr, aliases) {
  /** @type {String?} */
  let arg = null;
  aliases.forEach(function (item) {
    let index = arr.indexOf(item);
    if (-1 === index) {
      return null;
    }

    if (arg) {
      throw Error(`duplicate flag ${item}`);
    }

    arg = arr.splice(index, 1)[0];
  });

  return arg;
}

/**
 * @param {Array<String>} arr
 * @param {Array<String>} aliases
 * @returns {String?}
 */
function removeOption(arr, aliases) {
  /** @type {String?} */
  let arg = null;
  aliases.forEach(function (item) {
    let index = arr.indexOf(item);
    if (-1 === index) {
      return null;
    }

    // flag
    let flag = arr.splice(index, 1);

    if (arg) {
      throw Error(`duplicate flag ${item}`);
    }

    // flag's arg
    arg = arr.splice(index, 1)[0];
    if ("undefined" === typeof arg) {
      throw Error(`'${flag}' requires an argument`);
    }
  });

  return arg;
}

main()
  .then(function () {
    process.exit(0);
  })
  .catch(function (err) {
    console.error("Fail:");
    console.error(err.stack || err);
    process.exit(1);
  });
