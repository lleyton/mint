import { readdirSync } from "fs";

export const getFileList = (dirName: string, og = dirName) => {
  let files: string[] = [];
  const items = readdirSync(dirName, { withFileTypes: true });

  for (const item of items) {
    if (item.isDirectory()) {
      files = [...files, ...getFileList(`${dirName}/${item.name}`, og)];
    } else {
      const path = `${dirName}/${item.name}`;
      const name = path.replace(og, "");
      files.push(name);
    }
  }

  return files;
};
