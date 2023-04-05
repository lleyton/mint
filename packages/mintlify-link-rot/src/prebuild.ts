import path, { ParsedPath } from "path";
import { getFileList } from "@mintlify/prebuild";

// TODO refactor to prebuild package
const NODE_MODULES_DIRECTORY = "/node_modules";
const SUPPORTED_PAGE_EXTENSIONS = [".mdx", ".md"];
const SUPPORTED_MEDIA_EXTENSIONS = [
  "jpeg",
  "jpg",
  "jfif",
  "pjpeg",
  "pjp",
  "png",
  "svg",
  "svgz",
  "ico",
  "webp",
  "gif",
  "apng",
  "avif",
  "bmp",
  "mp4",
];

export const isNotNodeModule = (filePath: ParsedPath) =>
  !filePath.dir.startsWith(NODE_MODULES_DIRECTORY);

export const isValidPage = (filePath: ParsedPath) =>
  SUPPORTED_PAGE_EXTENSIONS.includes(filePath.ext);

export const isValidMedia = (filePath: ParsedPath) =>
  SUPPORTED_MEDIA_EXTENSIONS.includes(filePath.ext);

export const isValidLink = (filePath: ParsedPath) =>
  isValidPage(filePath) || isValidMedia(filePath);

export const normalizeFilePaths = (fileList: string[]) =>
  fileList.map(path.normalize).map(path.parse);

export const filterNodeModules = (fileList: string[]) =>
  normalizeFilePaths(fileList).filter(isNotNodeModule);

export const filterPages = (fileList: string[]) =>
  filterNodeModules(fileList).filter(isValidPage);

export const filterMedia = (fileList: string[]) =>
  filterNodeModules(fileList).filter(isValidMedia);

export const filterLinks = (fileList: string[]) =>
  filterNodeModules(fileList).filter(isValidLink);

export const getFullPath = (filePath: ParsedPath) =>
  path.join(filePath.dir, filePath.name + filePath.ext);

export const removeFileExtension = (filePath: ParsedPath) =>
  path.join(filePath.dir, filePath.name);

export const removeLeadingSlash = (filePathString: string) => {
  const hasLeadingSlash = filePathString.startsWith("/");
  return hasLeadingSlash ? filePathString.slice(1) : filePathString;
};

export const getPagePaths = (dirName: string) =>
  filterPages(getFileList(dirName)).map(getFullPath).map(removeLeadingSlash);
