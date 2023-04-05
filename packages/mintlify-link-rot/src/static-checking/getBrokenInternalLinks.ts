import { getValidInternalLinks } from "./getValidInternalLinks.js";
import { getUsedInternalLinksInSite } from "./getUsedInternalLinks.js";
import Chalk from "chalk";

export const getBrokenInternalLinks = async (dirName: string, print = true) => {
  const usedLinksPerFile = await getUsedInternalLinksInSite(dirName);
  const validLinks = getValidInternalLinks(dirName);
  const allBrokenLinks: string[] = [];
  Object.entries(usedLinksPerFile).forEach(([fileName, usedLinks]) => {
    const brokenLinks = usedLinks.filter((link) => !validLinks.has(link));
    if (brokenLinks.length === 0) return;
    allBrokenLinks.push(...brokenLinks);
    if (!print) return;
    console.group(`${Chalk.yellow(`Broken links in ${fileName}`)}:`);
    console.log(brokenLinks.join("\n"));
    console.groupEnd();
  });
  return allBrokenLinks;
};
