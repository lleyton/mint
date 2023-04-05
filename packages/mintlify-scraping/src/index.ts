#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-empty-function */

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import {
  scrapePageAutomatically,
  scrapePageWrapper,
} from "./scraping/scrapePageCommands.js";
import { scrapeGitBookPage } from "./scraping/site-scrapers/scrapeGitBookPage.js";
import { scrapeReadMePage } from "./scraping/site-scrapers/scrapeReadMePage.js";
import {
  scrapeSectionAutomatically,
  scrapeSectionAxiosWrapper,
  scrapeGitbookSectionCommand,
} from "./scraping/scrapeSectionCommands.js";
import { scrapeReadMeSection } from "./scraping/site-scrapers/scrapeReadMeSection.js";
import { scrapeIntercomPage } from "./scraping/site-scrapers/Intercom/scrapeIntercomPage.js";
import { scrapeIntercomSection } from "./scraping/site-scrapers/Intercom/scrapeIntercomSection.js";

yargs(hideBin(process.argv))
  .command(
    "page [url]",
    "Scrapes a page",
    () => {},
    async (argv) => {
      await scrapePageAutomatically(argv);
    }
  )
  .command(
    "gitbook-page [url]",
    "Scrapes a GitBook page",
    () => {},
    async (argv) => {
      await scrapePageWrapper(argv, scrapeGitBookPage);
    }
  )
  .command(
    "readme-page [url]",
    "Scrapes a ReadMe page",
    () => {},
    async (argv) => {
      await scrapePageWrapper(argv, scrapeReadMePage);
    }
  )
  .command(
    "intercom-page [url]",
    "Scrapes a Intercom page",
    () => {},
    async (argv) => {
      await scrapePageWrapper(argv, scrapeIntercomPage);
    }
  )
  .command(
    "section [url]",
    "Scrapes the docs in the section",
    () => {},
    async (argv) => {
      await scrapeSectionAutomatically(argv);
    }
  )
  .command(
    "gitbook-section [url]",
    "Scrapes the Gitbook section",
    () => {},
    async (argv) => {
      await scrapeGitbookSectionCommand(argv);
    }
  )
  .command(
    "readme-section [url]",
    "Scrapes the ReadMe section",
    () => {},
    async (argv) => {
      await scrapeSectionAxiosWrapper(argv, scrapeReadMeSection);
    }
  )
  .command(
    "intercom-section [url]",
    "Scrapes the Intercom section",
    () => {},
    async (argv) => {
      await scrapeSectionAxiosWrapper(argv, scrapeIntercomSection);
    }
  )
  // Print the help menu when the user enters an invalid command.
  .strictCommands()
  .demandCommand(
    1,
    "Unknown command. See above for the list of supported commands."
  )

  // Alias option flags --help = -h, --version = -v
  .alias("h", "help")
  .alias("v", "version")

  .parse();
