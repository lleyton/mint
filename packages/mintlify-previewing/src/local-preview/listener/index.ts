import chokidar from "chokidar";
import fse from "fs-extra";
import pathUtil from "path";
import Chalk from "chalk";
import mintValidation from "@mintlify/validation";
import { isFileSizeValid, openApiCheck } from "./utils.js";
import { updateGeneratedNav, updateOpenApiFiles } from "./update.js";
import { CLIENT_PATH, CMD_EXEC_PATH } from "../../constants.js";
import { promises as _promises } from "fs";
import createPage from "./utils/createPage.js";
import { getCategory } from "./categorize.js";
import { PotentialFileCategory, FileCategory } from "./utils/types.js";

const { readFile } = _promises;

const listener = () => {
  chokidar
    .watch(CMD_EXEC_PATH, {
      ignoreInitial: true,
      ignored: ["node_modules", ".git", ".idea"],
      cwd: CMD_EXEC_PATH,
    })
    .on("add", async (filename: string) => {
      try {
        const category = await onUpdateEvent(filename);
        switch (category) {
          case "page":
            console.log("New page detected: ", filename);
            break;
          case "snippet":
            console.log("New snippet detected: ", filename);
            break;
          case "mintConfig":
            console.log("Config added");
            break;
          case "openApi":
            console.log("OpenApi spec added: ", filename);
            break;
          case "staticFile":
            console.log("Static file added: ", filename);
            break;
        }
      } catch (error) {
        console.error(error.message);
      }
    })
    .on("change", async (filename: string) => {
      try {
        const category = await onUpdateEvent(filename);
        switch (category) {
          case "page":
            console.log("Page edited: ", filename);
            break;
          case "snippet":
            console.log("Snippet edited: ", filename);
            break;
          case "mintConfig":
            console.log("Config edited");
            break;
          case "openApi":
            console.log("OpenApi spec edited: ", filename);
            break;
          case "staticFile":
            console.log("Static file edited: ", filename);
            break;
        }
      } catch (error) {
        console.error(error.message);
      }
    })
    .on("unlink", async (filename: string) => {
      try {
        const potentialCategory = getCategory(filename);
        const targetPath = getTargetPath(potentialCategory, filename);
        if (
          potentialCategory === "page" ||
          potentialCategory === "snippet" ||
          potentialCategory === "mintConfig" ||
          potentialCategory === "staticFile"
        ) {
          await fse.remove(targetPath);
        }
        switch (potentialCategory) {
          case "page":
            console.log(`Page deleted: ${filename}`);
            break;
          case "snippet":
            console.log(`Snippet deleted: ${filename}`);
            break;
          case "mintConfig":
            console.log(
              "⚠️ mint.json deleted. Please create a new mint.json file as it is mandatory."
            );
            process.exit(1);
          case "potentialJsonOpenApiSpec":
          case "potentialYamlOpenApiSpec":
            await updateOpenApiFiles();
            await updateGeneratedNav();
            break;
          case "staticFile":
            console.log("Static file deleted: ", filename);
            break;
        }
      } catch (error) {
        console.error(error.message);
      }
    });
};

const getTargetPath = (
  potentialCategory: PotentialFileCategory,
  filePath: string
): string => {
  switch (potentialCategory) {
    case "page":
    case "snippet":
      return pathUtil.join(CLIENT_PATH, "src", "_props", filePath);
    case "mintConfig":
      return pathUtil.join(CLIENT_PATH, "src", "_props", "mint.json");
    case "potentialYamlOpenApiSpec":
    case "potentialJsonOpenApiSpec":
      return pathUtil.join(CLIENT_PATH, "src", "_props", "openApiFiles.json");
    case "staticFile":
      return pathUtil.join(CLIENT_PATH, "public", filePath);
    default:
      throw new Error("Invalid category");
  }
};

/**
 * This function is called when a file is added or changed
 * @param filename
 * @returns FileCategory
 */
const onUpdateEvent = async (filename: string): Promise<FileCategory> => {
  const filePath = pathUtil.join(CMD_EXEC_PATH, filename);
  const potentialCategory = getCategory(filename);
  const targetPath = getTargetPath(potentialCategory, filename);
  let regenerateNav = false;
  let category: FileCategory =
    potentialCategory === "potentialYamlOpenApiSpec" ||
    potentialCategory === "potentialJsonOpenApiSpec"
      ? "staticFile"
      : potentialCategory;

  switch (potentialCategory) {
    case "page":
      regenerateNav = true;

      const contentStr = (await readFile(filePath)).toString();
      const { pageContent } = await createPage(
        filename,
        contentStr,
        CMD_EXEC_PATH,
        []
      );
      await fse.outputFile(targetPath, pageContent, {
        flag: "w",
      });
      break;
    case "snippet":
      await fse.copy(filePath, targetPath);
      break;
    case "mintConfig":
      regenerateNav = true;

      const mintJsonFileContent = (await readFile(filePath)).toString();
      try {
        const mintConfig = JSON.parse(mintJsonFileContent);
        const { status, errors, warnings } =
          mintValidation.validateMintConfig(mintConfig);

        errors.forEach((error) => {
          console.error(`🚨 ${Chalk.red(error)}`);
        });

        warnings.forEach((warning) => {
          console.warn(`⚠️ ${Chalk.yellow(warning)}`);
        });

        if (status === "success") {
          await fse.copy(filePath, targetPath);
        }
      } catch (error) {
        if (error.name === "SyntaxError") {
          console.error(
            `🚨 ${Chalk.red(
              "mint.json has invalid JSON. You are likely missing a comma or a bracket. You can paste your mint.json file into https://jsonlint.com/ to get a more specific error message."
            )}`
          );
        } else {
          console.error(`🚨 ${Chalk.red(error.message)}`);
        }
      }

      break;
    case "potentialYamlOpenApiSpec":
    case "potentialJsonOpenApiSpec":
      let isOpenApi = false;
      const openApiInfo = await openApiCheck(filePath);
      isOpenApi = openApiInfo.isOpenApi;
      if (isOpenApi) {
        // TODO: Instead of re-generating all openApi files, optimize by just updating the specific file that changed.
        await updateOpenApiFiles();
        regenerateNav = true;
        category = "openApi";
      }
      break;
    case "staticFile":
      if (await isFileSizeValid(filePath, 5)) {
        await fse.copy(filePath, targetPath);
      } else {
        console.error(
          Chalk.red(
            `🚨 The file at ${filename} is too big. The maximum file size is 5 mb.`
          )
        );
      }
      break;
  }
  if (regenerateNav) {
    // TODO: Instead of re-generating the entire nav, optimize by just updating the specific page that changed.
    await updateGeneratedNav();
  }
  return category;
};

export default listener;
