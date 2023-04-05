import SwaggerParser from "@apidevtools/swagger-parser";
import { promises as _promises } from "fs";

const { readdir, stat } = _promises;

export const getFileExtension = (filename: string) => {
  return (
    filename.substring(filename.lastIndexOf(".") + 1, filename.length) ||
    filename
  );
};

export type OpenApiCheckResult = {
  spec: any;
  isOpenApi: boolean;
};

export const openApiCheck = async (
  path: string
): Promise<OpenApiCheckResult> => {
  let spec;
  let isOpenApi = false;
  try {
    spec = await SwaggerParser.validate(path);
    isOpenApi = true;
  } catch {
    // not valid openApi
  }
  return { spec, isOpenApi };
};

export const filterOutNullInGroup = (group: MintNavigation) => {
  const newPages = filterOutNullInPages(group.pages);
  const newGroup = {
    ...group,
    pages: newPages,
  };
  return newGroup;
};

const filterOutNullInPages = (pages: (MintNavigationEntry | null)[]) => {
  const newPages: MintNavigationEntry[] = [];
  pages.forEach((page) => {
    if (page == null) {
      return;
    }
    if (page.hasOwnProperty("pages")) {
      const group = page as MintNavigation;
      const newGroup = filterOutNullInGroup(group);
      newPages.push(newGroup);
    } else {
      newPages.push(page);
    }
  });

  return newPages;
};

export const isFileSizeValid = async (
  path: string,
  maxFileSizeInMb: number
): Promise<boolean> => {
  const maxFileSizeBytes = maxFileSizeInMb * 1000000;
  const stats = await stat(path);
  return stats.size <= maxFileSizeBytes;
};

export function isError(obj: unknown) {
  return Object.prototype.toString.call(obj) === "[object Error]";
}
