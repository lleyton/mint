import { GroupPage, Groups, PageMetaTags, isPage } from '@/types/metadata';

export function getFirstPageStartingWith(navWithMetadata: Groups, hrefStart: string): PageMetaTags {
  let firstStartingWith = {};

  navWithMetadata.every((navEntry) => {
    const page = findFirstStartingWith(navEntry, hrefStart);
    if (page) {
      firstStartingWith = page;
      return false;
    }
    return true;
  });

  return firstStartingWith;
}

const findFirstStartingWith = (entry: GroupPage, hrefStart: string): PageMetaTags | null => {
  if (isPage(entry)) {
    if (entry.href?.startsWith(hrefStart)) {
      return entry;
    }
    return null;
  }

  if (!Array.isArray(entry.pages) || entry.pages.length === 0) {
    return null;
  }

  // Recursively search for the first page
  for (const subEntry of entry.pages) {
    const first = findFirstStartingWith(subEntry, hrefStart);
    if (first) {
      return first;
    }
  }

  return null;
};
