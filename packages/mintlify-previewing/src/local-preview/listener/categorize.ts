// TODO - put in prebuild package
import path from "path";

import { getFileList } from "@mintlify/prebuild";
import { getFileExtension, openApiCheck } from "./utils.js";
import { PotentialFileCategory } from "./utils/types.js";

export const categorizeFiles = async (contentDirectoryPath: string) => {
  const allFilesInCmdExecutionPath: string[] =
    getFileList(contentDirectoryPath);
  const contentFilenames: string[] = [];
  const staticFilenames: string[] = [];
  const promises: Promise<void>[] = [];
  const openApiFiles: OpenApiFile[] = [];
  const snippets: string[] = [];
  allFilesInCmdExecutionPath.forEach((filename: string) => {
    promises.push(
      (async () => {
        const extension = getFileExtension(filename);
        let isOpenApi = false;
        if (extension && (extension === "mdx" || extension === "md")) {
          if (filename.startsWith("/_snippets")) {
            snippets.push(filename);
          } else {
            contentFilenames.push(filename);
          }
        } else if (
          extension &&
          (extension === "json" || extension === "yaml" || extension === "yml")
        ) {
          const openApiInfo = await openApiCheck(
            path.join(contentDirectoryPath, filename)
          );
          isOpenApi = openApiInfo.isOpenApi;
          if (isOpenApi) {
            const fileName = path.parse(filename).base;
            openApiFiles.push({
              filename: fileName.substring(0, fileName.lastIndexOf(".")),
              spec: openApiInfo.spec,
            });
          }
        } else if (!filename.endsWith("mint.json") && !isOpenApi) {
          // all other files
          staticFilenames.push(filename);
        }
      })()
    );
  });
  await Promise.all(promises);

  return { contentFilenames, staticFilenames, openApiFiles, snippets };
};

const excludedMdFiles = ["readme", "license", "contributing", "contribute"];

const supportedStaticFileExtensions = [
  ".jpeg",
  ".jpg",
  ".jfif",
  ".pjpeg",
  ".pjp",
  ".png",
  ".svg",
  ".svgz",
  ".ico",
  ".webp",
  ".gif",
  ".apng",
  ".avif",
  ".bmp",
  ".mp4",
];

export const getCategory = (filePath: string): PotentialFileCategory => {
  filePath = filePath.toLowerCase();

  const parsed = path.parse(filePath);

  if (parsed.base === "mint.json") {
    return "mintConfig";
  }

  const fileName = parsed.name;
  const extension = parsed.ext;
  if (
    filePath.startsWith("_snippets") &&
    (extension === ".mdx" || extension === ".md")
  ) {
    return "snippet";
  } else if (extension === ".mdx") {
    return "page";
  } else if (extension === ".md") {
    // Exclude common markdown files people don't want on their docs website
    if (excludedMdFiles.includes(fileName)) {
      throw new Error("Excluded Md File");
    }
    return "page";
  } else if (extension === ".yaml" || extension === ".yml") {
    return "potentialYamlOpenApiSpec";
  } else if (extension === ".json") {
    return "potentialJsonOpenApiSpec";
  } else if (supportedStaticFileExtensions.includes(extension)) {
    return "staticFile";
  }

  throw new Error("Unsupported File Type, No change enacted");
};
