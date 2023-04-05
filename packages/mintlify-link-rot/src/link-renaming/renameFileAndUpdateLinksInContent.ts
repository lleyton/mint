import { existsSync, lstatSync, renameSync } from "fs";
import { normalize, parse, ParsedPath } from "path";
import renameInternalLinksInPage from "./renameInternalLinksInPage.js";
import { isValidPage, removeFileExtension, getPagePaths } from "../prebuild.js";

/**
 * Renames a link in the file system. If the link is a directory, all links within the directory will be renamed as well.
 * @param existingDir - The existing directory or file to rename
 * @param newDirName - The new directory or file name
 * @param force
 */
export const renameFileAndUpdateLinksInContent = async (
  existingDir: string,
  newDirName: string,
  force = false
) => {
  existingDir = normalize(existingDir);
  newDirName = normalize(newDirName);
  const existingDirParsed: ParsedPath = parse(existingDir);
  const newDirParsed: ParsedPath = parse(newDirName);
  if (!existsSync(existingDir)) {
    throw new Error("File or folder does not exist at " + existingDir);
  }
  if (!force && existsSync(newDirName)) {
    throw new Error(
      "File or folder exists at " + newDirName + ". Use --force to overwrite."
    );
  }

  const isDirectory = lstatSync(existingDir).isDirectory();
  if (!isDirectory) {
    if (!isValidPage(existingDirParsed)) {
      throw new Error("File to rename must be an MDX or Markdown file.");
    }
    if (!isValidPage(newDirParsed)) {
      throw new Error("New file name must be an MDX or Markdown file.");
    }
  }
  renameSync(existingDir, newDirName);
  console.log(`Renamed ${existingDir} to ${newDirName}.`);

  const existingLink = removeFileExtension(existingDirParsed);
  const newLink = removeFileExtension(newDirParsed);
  const pagesInDirectory = getPagePaths(process.cwd());
  const renameLinkPromises: Promise<void>[] = [];
  pagesInDirectory.forEach((filePath: string) => {
    renameLinkPromises.push(
      (async () => {
        const numRenamedLinks = await renameInternalLinksInPage(
          filePath,
          existingLink,
          newLink
        );
        if (numRenamedLinks > 0) {
          console.log(`Renamed ${numRenamedLinks} link(s) in ${filePath}`);
        }
      })()
    );
  });
  await Promise.all(renameLinkPromises);
  return;
};
