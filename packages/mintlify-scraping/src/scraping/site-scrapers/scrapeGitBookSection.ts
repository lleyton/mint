import cheerio from "cheerio";
import { scrapeGettingFileNameFromUrl } from "../scrapeGettingFileNameFromUrl.js";
import { scrapeGitBookPage } from "./scrapeGitBookPage.js";
import combineNavWithEmptyGroupTitles from "../combineNavWithEmptyGroupTitles.js";
import getLinksRecursivelyGitBook from "./links-per-group/getLinksRecursivelyGitBook.js";
import alternateGroupTitle from "./alternateGroupTitle.js";
import downloadLogoImage from "../downloadLogoImage.js";

export async function scrapeGitBookSection(
  html: string,
  origin: string,
  cliDir: string,
  imageBaseDir: string,
  overwrite: boolean,
  version: string | undefined
): Promise<MintNavigationEntry[]> {
  const $ = cheerio.load(html);

  // Download the logo
  const logoSrc = $('a[data-testid="public.headerHomeLink"] img')
    .first()
    .attr("src");
  downloadLogoImage(logoSrc, imageBaseDir, origin, overwrite);

  // Get all the navigation sections
  // Some variants of the GitBook UI show the logo and search base in the side navigation bar,
  // but the navigation sections are always the last value.
  const navigationSections: cheerio.Cheerio = $(
    'div[data-testid="page.desktopTableOfContents"] > nav > div:first-child'
  )
    .children()
    .eq(-1)
    .children()
    .first()
    .children();

  // Get all links per group
  const groupsConfig: MintNavigation[] = navigationSections
    .toArray()
    .map((s: cheerio.Element) => {
      const section = $(s);
      const sectionTitle = $(section)
        .find('div > div[dir="auto"]')
        .first()
        .text();

      // Only present if the nested navigation is not in a group
      const firstLink = section.children().eq(0);
      const firstHref = firstLink.attr("href");

      const linkSections: cheerio.Cheerio = section.children().eq(1).children();
      const pages = getLinksRecursivelyGitBook(linkSections, $);

      return {
        group: sectionTitle || alternateGroupTitle(firstLink, pages),
        pages: firstHref ? [firstHref, ...pages] : pages,
      };
    })
    .filter(Boolean);

  // Merge groups with empty titles together
  const reducedGroupsConfig = combineNavWithEmptyGroupTitles(groupsConfig);

  // Scrape each link in the navigation.
  const groupsConfigCleanPaths = await Promise.all(
    reducedGroupsConfig.map(async (navEntry: MintNavigationEntry) => {
      return await scrapeGettingFileNameFromUrl(
        navEntry,
        cliDir,
        origin,
        overwrite,
        scrapeGitBookPage,
        true,
        version
      );
    })
  );

  return groupsConfigCleanPaths;
}
