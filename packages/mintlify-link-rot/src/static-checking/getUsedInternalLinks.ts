import isAbsoluteUrl from "is-absolute-url";
import fs from "fs-extra";
import type { Root } from "mdast";
import type { MdxJsxFlowElement } from "mdast-util-mdx-jsx";
import { remark } from "remark";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import { visit } from "unist-util-visit";
import {
  getFullPath,
  getPagePaths,
  normalizeFilePaths,
  removeLeadingSlash,
} from "../prebuild.js";
import path from "path";

const isDataString = (str: string) => str.startsWith("data:");

export const getUsedInternalLinksInPage = async (content: string) => {
  const links: string[] = [];
  const visitLinks = () => {
    return (tree: Root) => {
      visit(tree, (node) => {
        if (
          // ![]() format
          (node.type === "link" || node.type === "image") &&
          node.url &&
          !isAbsoluteUrl(node.url) &&
          !isDataString(node.url)
        ) {
          links.push(node.url);
          return;
        }
        const mdxJsxFlowElement = node as MdxJsxFlowElement;
        if (
          mdxJsxFlowElement.name === "img" ||
          mdxJsxFlowElement.name === "source"
        ) {
          const srcAttrIndex = mdxJsxFlowElement.attributes.findIndex(
            (attr) => attr.type === "mdxJsxAttribute" && attr.name === "src"
          );
          const nodeUrl = mdxJsxFlowElement.attributes[srcAttrIndex].value;
          if (
            srcAttrIndex !== -1 &&
            typeof nodeUrl === "string" &&
            !isAbsoluteUrl(nodeUrl) &&
            !isDataString(nodeUrl)
          ) {
            links.push(nodeUrl);
          }
        } else if (mdxJsxFlowElement.name === "a") {
          const hrefAttrIndex = mdxJsxFlowElement.attributes.findIndex(
            (attr) => attr.type === "mdxJsxAttribute" && attr.name === "href"
          );
          const nodeUrl = mdxJsxFlowElement.attributes[hrefAttrIndex].value;
          if (
            hrefAttrIndex !== -1 &&
            typeof nodeUrl === "string" &&
            !isAbsoluteUrl(nodeUrl) &&
            !isDataString(nodeUrl)
          ) {
            links.push(nodeUrl);
          }
        }
      });
      return tree;
    };
  };
  await remark()
    .use(remarkMdx)
    .use(remarkGfm)
    .use(remarkFrontmatter, ["yaml", "toml"])
    .use(visitLinks)
    .process(content);
  return normalizeFilePaths(links).map(getFullPath).map(removeLeadingSlash);
};

export const getUsedInternalLinksInSite = async (dirName: string) => {
  const dirChildren = getPagePaths(dirName);
  const getLinksPromises: Promise<void>[] = [];
  const usedLinksInSite: Record<string, string[]> = {};
  dirChildren.forEach((filePath) => {
    getLinksPromises.push(
      (async () => {
        const fileContent = fs
          .readFileSync(path.join(dirName, filePath))
          .toString();
        const usedLinksInPage = await getUsedInternalLinksInPage(fileContent);
        usedLinksInSite[filePath] = usedLinksInPage;
      })()
    );
  });
  await Promise.all(getLinksPromises);
  return usedLinksInSite;
};
