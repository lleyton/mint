// TODO - rename to prebuild after legacy-components-imports is merged
import categorizeFiles from './categorizeFiles.js';
import { getConfigPath, update } from './update.js';

const contentDirectoryPath = process.argv[2] ?? '../docs'; // TODO - change default folder to something more generic for self-serve

const preconfigure = async () => {
  const { contentFilenames, staticFilenames, openApiFiles, snippets } = await categorizeFiles(
    contentDirectoryPath
  );
  await update(contentDirectoryPath, staticFilenames, openApiFiles, contentFilenames, snippets);
};

(async function () {
  try {
    const configPath = await getConfigPath(contentDirectoryPath);
    if (configPath == null) {
      console.error('⚠️ Must be ran in a directory where a mint.json file exists.');
      return;
    }
    await preconfigure();
  } catch (error) {
    console.log(error);
    console.error('⚠️   Error while fetching config settings');
  }
})();
