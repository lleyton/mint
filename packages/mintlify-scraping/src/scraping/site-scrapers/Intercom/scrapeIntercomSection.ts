import cheerio from "cheerio";
import { scrapeIntercomPage } from "./scrapeIntercomPage.js";
import { scrapeGettingFileNameFromUrl } from "../../scrapeGettingFileNameFromUrl.js";
import downloadLogoImage from "../../downloadLogoImage.js";
import axios from "axios";

export async function scrapeIntercomSection(
  html: string,
  origin: string,
  cliDir: string,
  imageBaseDir: string,
  overwrite: boolean,
  version: string | undefined
): Promise<MintNavigationEntry[]> {
  let $ = cheerio.load(html);

  const logoSrc = $(".header__logo img").first().attr("src");
  downloadLogoImage(logoSrc, imageBaseDir, origin, overwrite);

  const collectionsLink = $(".section .g__space a");
  const collectionsMap = collectionsLink
    .toArray()
    .map(async (s: cheerio.Element) => {
      const href = $(s).attr("href");
      const res = await axios.get(`${origin}${href}`);
      const html = res.data;
      $ = cheerio.load(html);
      const sectionTitle = $(".collection h1").first().text().trim();
      const sectionPages = $(".section .g__space a")
        .toArray()
        .map((s: cheerio.Element) => $(s).attr("href"))
        .filter((page) => page !== undefined) as string[];
      return {
        group: sectionTitle,
        pages: sectionPages,
      };
    });

  const collections: MintNavigation[] = await Promise.all(collectionsMap);

  return await Promise.all(
    collections.map(async (entry: MintNavigationEntry) => {
      return await scrapeGettingFileNameFromUrl(
        entry,
        cliDir,
        origin,
        overwrite,
        scrapeIntercomPage,
        false,
        version
      );
    })
  );
}
