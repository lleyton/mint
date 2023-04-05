// TODO - add types
import { promises as _promises } from "fs";
import { outputFile } from "fs-extra";
import path from "path";
import createPage from "./utils/createPage.js";
import { categorizeFiles } from "./categorize.js";
import { CMD_EXEC_PATH } from "../../constants.js";
import { getConfigObj } from "./utils/mintConfigFile.js";

const { readFile } = _promises;

type DecoratedMintNavigation = DecoratedMintNavigationEntry[];

type DecoratedMintNavigationEntry = {
  group: string;
  version?: string;
  pages: DecoratedMintNavigationEntryChild[];
};

type DecoratedMintNavigationEntryChild =
  | DecoratedMintNavigationEntry
  | PageMetadata;

type PageMetadata = Record<PageMetadataKeys, string>;

const pageMetadataKeys = [
  "title",
  "description",
  "sidebarTitle",
  "href",
  "api",
  "openapi",
  "contentType",
  "auth",
  "version",
  "mode",
  "hideFooterPagination",
  "authors",
  "lastUpdatedDate",
  "createdDate",
  "size",
] as const;

type PageMetadataKeys = typeof pageMetadataKeys[number];

const generateDecoratedMintNavigationFromPages = (
  filenamePageMetadataMap: Record<string, PageMetadata>,
  mintConfigNav: MintNavigation[]
): DecoratedMintNavigation => {
  const filenames = Object.keys(filenamePageMetadataMap);
  const createNav = (nav: MintNavigation): DecoratedMintNavigationEntry => {
    return {
      group: nav.group,
      version: nav?.version,
      pages: nav.pages.map((page: MintNavigationEntry) => {
        if (typeof page === "string" && filenames.includes(page)) {
          return filenamePageMetadataMap[page];
        }
        return createNav(page as MintNavigation);
      }),
    };
  };

  return mintConfigNav.map((nav) => createNav(nav));
};

const createFilenamePageMetadataMap = async (
  contentDirectoryPath: string,
  contentFilenames: string[],
  openApiFiles: OpenApiFile[],
  clientPath?: string,
  writeFiles = false
) => {
  let pagesAcc = {};
  const contentPromises: Promise<void>[] = [];
  contentFilenames.forEach((filename) => {
    contentPromises.push(
      (async () => {
        const sourcePath = path.join(contentDirectoryPath, filename);

        const contentStr = (await readFile(sourcePath)).toString();
        const { slug, pageMetadata, pageContent } = await createPage(
          filename,
          contentStr,
          contentDirectoryPath,
          openApiFiles
        );
        if (clientPath && writeFiles) {
          const targetPath = path.join(clientPath, "src", "_props", filename);
          await outputFile(targetPath, pageContent, {
            flag: "w",
          });
        }
        pagesAcc = {
          ...pagesAcc,
          [slug]: pageMetadata,
        };
      })()
    );
  });
  await Promise.all(contentPromises);
  return pagesAcc;
};

export const generateNav = async () => {
  const { contentFilenames, openApiFiles } = await categorizeFiles(
    CMD_EXEC_PATH
  );
  const [filenamePageMetadataMap, configObj] = await Promise.all([
    createFilenamePageMetadataMap(
      CMD_EXEC_PATH,
      contentFilenames,
      openApiFiles
    ),
    getConfigObj(CMD_EXEC_PATH),
  ]);
  return generateDecoratedMintNavigationFromPages(
    filenamePageMetadataMap,
    configObj?.navigation
  );
};
