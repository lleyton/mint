#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-empty-function */

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { dev, installDepsCommand } from "@mintlify/previewing";

export const cli = () =>
  yargs(hideBin(process.argv))
    .command(
      "dev",
      "Runs Mintlify locally (Must run in directory with mint.json)",
      () => {},
      async (argv) => {
        await dev(argv);
      }
    )
    .command(
      "install",
      "Install dependencies for local Mintlify",
      () => {},
      installDepsCommand
    )
    // Print the help menu when the user enters an invalid command.
    .strictCommands()
    .demandCommand(
      1,
      "Unknown command. See above for the list of supported commands."
    )

    // Alias option flags --help = -h, --version = -v
    .alias("h", "help")
    .alias("v", "version")

    .parse();

cli();
