import Chalk from "chalk";
import child_process from "child_process";
import open from "open";
import fse, { pathExists } from "fs-extra";
import inquirer from "inquirer";
import { isInternetAvailable } from "is-internet-available";
import path from "path";
import shell from "shelljs";
import { Octokit } from "@octokit/rest";
import {
  CLIENT_PATH,
  HOME_DIR,
  DOT_MINTLIFY,
  CMD_EXEC_PATH,
  TARGET_MINT_VERSION,
  VERSION_PATH,
  MINT_PATH,
} from "../constants.js";
import { buildLogger, ensureYarn } from "../util.js";
import listener from "./listener/index.js";
import { ArgumentsCamelCase } from "yargs";
import { getConfigPath } from "./listener/utils/mintConfigFile.js";
import type { Ora as OraType } from "ora";

const nodeModulesExists = async () => {
  return pathExists(path.join(DOT_MINTLIFY, "mint", "client", "node_modules"));
};

const promptForYarn = async () => {
  const yarnInstalled = shell.which("yarn");
  if (!yarnInstalled) {
    await inquirer
      .prompt([
        {
          type: "confirm",
          name: "confirm",
          message: "yarn must be globally installed. Install yarn?",
          default: true,
        },
      ])
      .then(({ confirm }) => {
        if (confirm) {
          shell.exec("npm install --global yarn");
        } else {
          console.log("Installation cancelled.");
        }
      });
  }
};

const downloadTargetMint = async (logger: OraType) => {
  fse.emptyDirSync(MINT_PATH);

  logger.text = "Downloading Mintlify framework...";

  const octokit = new Octokit();
  const downloadRes = await octokit.repos.downloadTarballArchive({
    owner: "mintlify",
    repo: "mint",
    ref: TARGET_MINT_VERSION,
  });

  logger.text = "Extracting Mintlify framework...";
  const TAR_PATH = path.join(MINT_PATH, "mint.tar.gz");
  fse.writeFileSync(TAR_PATH, Buffer.from(downloadRes.data as any));

  // strip-components 1 removes the top level directory from the unzipped content
  // which is a folder with the release sha
  fse.mkdirSync(path.join(MINT_PATH, "mint-tmp"));
  shell.exec("tar -xzf mint.tar.gz -C mint-tmp --strip-components 1", {
    silent: true,
  });

  fse.removeSync(TAR_PATH);

  fse.moveSync(
    path.join(MINT_PATH, "mint-tmp", "client"),
    path.join(CLIENT_PATH)
  );

  fse.writeFileSync(VERSION_PATH, TARGET_MINT_VERSION);

  // Delete unnecessary content downloaded from GitHub
  fse.removeSync(path.join(MINT_PATH, "mint-tmp"));

  logger.text = "Installing dependencies...";

  ensureYarn(logger);
  shell.cd(CLIENT_PATH);
  shell.exec("yarn", { silent: true });
};

const checkForMintJson = async (logger: OraType) => {
  const configPath = await getConfigPath(CMD_EXEC_PATH);
  if (configPath == null) {
    logger.fail("Must be ran in a directory where a mint.json file exists.");
    process.exit(1);
  }
  return;
};

const dev = async (argv: ArgumentsCamelCase) => {
  shell.cd(HOME_DIR);
  await promptForYarn();
  const logger = buildLogger("Preparing local Mintlify instance...");
  await fse.ensureDir(MINT_PATH);
  shell.cd(MINT_PATH);

  const internet = await isInternetAvailable();
  if (!internet && !(await pathExists(CLIENT_PATH))) {
    logger.fail(
      "Running mintlify dev for the first time requires an internet connection."
    );
    process.exit(1);
  }

  if (internet) {
    const mintVersionExists = await pathExists(VERSION_PATH);

    let needToDownloadTargetMint = !mintVersionExists;

    if (mintVersionExists) {
      const currVersion = fse.readFileSync(VERSION_PATH, "utf8");
      if (currVersion !== TARGET_MINT_VERSION) {
        needToDownloadTargetMint = true;
      }
    }

    if (needToDownloadTargetMint) {
      await downloadTargetMint(logger);
    }
  }

  if (!(await nodeModulesExists())) {
    if (!internet) {
      logger.fail(`Dependencies are missing and you are offline. Connect to the internet and run
  
      mintlify install
      
      `);
    } else {
      logger.fail(`Dependencies were not installed correctly, run
  
      mintlify install
      
      `);
    }
    process.exit(1);
  }
  await checkForMintJson(logger);
  shell.cd(CLIENT_PATH);
  const relativePath = path.relative(CLIENT_PATH, CMD_EXEC_PATH);
  child_process.spawnSync("yarn preconfigure", [relativePath], { shell: true });
  logger.succeed("Local Mintlify instance is ready. Launching your site...");
  run((argv.port as string) || "3000");
};

const run = (port: string) => {
  shell.cd(CLIENT_PATH);

  // next-remote-watch can only receive ports as env variables
  // https://github.com/hashicorp/next-remote-watch/issues/23
  const mintlifyDevProcess = child_process.spawn("npm run dev-watch", {
    env: {
      ...process.env,
      PORT: port,
    },
    cwd: CLIENT_PATH,
    stdio: "pipe",
    shell: true,
  });
  mintlifyDevProcess.stdout.on("data", (data) => {
    const output = data.toString();
    console.log(output);
    if (output.startsWith("> Ready on http://localhost:")) {
      console.log(
        `🌿 ${Chalk.green(
          `Your local preview is available at http://localhost:${port}`
        )}`
      );
      console.log(
        `🌿 ${Chalk.green("Press Ctrl+C any time to stop the local preview.")}`
      );
      open(`http://localhost:${port}`);
    }
  });
  const onExit = () => {
    mintlifyDevProcess.kill("SIGINT");
    process.exit(0);
  };
  process.on("SIGINT", onExit);
  process.on("SIGTERM", onExit);
  listener();
};

export default dev;
