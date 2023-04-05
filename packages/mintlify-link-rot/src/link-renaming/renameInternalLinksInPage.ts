/**
 * @typedef {import('remark-mdx')}
 */
import fs from "fs-extra";
import type { Root } from "mdast";
import { normalize } from "path";
import { remark } from "remark";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import { visit } from "unist-util-visit";

/**
 * Go through fileContent and replace all links that match existingLink with
 * newLink
 */
const getContentWithRenamedInternalLinks = async (
  fileContent: string,
  existingLink: string,
  newLink: string
) => {
  let numRenamedLinks = 0;
  const remarkMdxReplaceLinks = () => {
    return (tree: Root) => {
      visit(tree, (node) => {
        // ![]() format
        if (
          node.type === "link" &&
          node.url &&
          normalize(node.url) === existingLink
        ) {
          node.url = newLink;
          numRenamedLinks++;
        }
        return;
      });
    };
  };
  const file = await remark()
    .use(remarkMdx)
    .use(remarkGfm)
    .use(remarkFrontmatter, ["yaml", "toml"])
    .use(remarkMdxReplaceLinks)
    .process(fileContent);
  return {
    numRenamedLinks,
    newContent: String(file),
  };
};

const renameInternalLinksInPage = async (
  filePath: string,
  existingLink: string,
  newLink: string
): Promise<number> => {
  const fileContent = fs.readFileSync(filePath).toString();
  const { numRenamedLinks, newContent } =
    await getContentWithRenamedInternalLinks(
      fileContent,
      existingLink,
      newLink
    );
  fs.outputFileSync(filePath, newContent, {
    flag: "w",
  });
  return numRenamedLinks;
};

export default renameInternalLinksInPage;
