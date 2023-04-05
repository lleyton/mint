import { getFileList } from "@mintlify/prebuild";
import {
  filterLinks,
  removeFileExtension,
  removeLeadingSlash,
} from "../prebuild.js";

export const getValidInternalLinks = (dirName: string) =>
  new Set(
    filterLinks(getFileList(dirName))
      .map(removeFileExtension)
      .map(removeLeadingSlash)
  );
