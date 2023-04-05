import type { Config } from '@/types/config';
import { FaviconsProps } from '@/types/favicons';
import { Groups, PageMetaTags } from '@/types/metadata';
import { OpenApiFile } from '@/types/openApi';
import { Snippet } from '@/types/snippet';
import { prepareToSerialize } from '@/utils/staticProps/prepareToSerialize';

import {
  getPagePath,
  getFileContents,
  getPrebuiltData,
  confirmFaviconsWereGenerated,
  getSnippets,
  extractPageMetadata,
} from './utils';

/**
 * @returns All props needed for getStaticProps | Only navWithMetadata if page is not found
 */
export const getPageProps = async (
  slug: string
): Promise<
  | {
      navWithMetadata: Groups;
    }
  | { notFound: boolean }
  | {
      content: string;
      pageData: {
        mintConfig: Config;
        navWithMetadata: Groups;
        openApiFiles: OpenApiFile[];
        pageMetadata: PageMetaTags;
      };
      snippets: Snippet[];
      favicons?: FaviconsProps;
    }
> => {
  let navWithMetadata: Groups = [];
  try {
    navWithMetadata = await getPrebuiltData('generatedNav');
  } catch {
    // Try catches are purposefully empty because it isn't the end
    // of the world if some of these prebuilt variables are not existent.
    // We just fall back to the empty value, but we will want to do
    // better error handling.
  }
  let openApiFiles: OpenApiFile[] = [];
  try {
    openApiFiles = await getPrebuiltData('openApiFiles');
  } catch {}
  const pagePath = await getPagePath(slug);
  let content = '';
  let pageMetadata: PageMetaTags = {};
  if (pagePath) {
    const contentWithFrontmatter = await getFileContents(pagePath);
    const metadataAndContent = extractPageMetadata(pagePath, contentWithFrontmatter, openApiFiles);
    content = metadataAndContent.content;
    pageMetadata = metadataAndContent.pageMetadata;
  } else {
    // redirect
    return { navWithMetadata };
  }

  let mintConfig: Config = { name: '' };
  try {
    mintConfig = await getPrebuiltData('mint');
  } catch {
    return {
      notFound: true,
    };
  }
  const favicons: FaviconsProps | undefined =
    mintConfig?.favicon && (await confirmFaviconsWereGenerated()) ? defaultFavicons : undefined;

  const snippets = await getSnippets();
  return {
    content,
    pageData: prepareToSerialize({
      mintConfig,
      navWithMetadata,
      openApiFiles,
      pageMetadata,
    }),
    snippets,
    favicons,
  };
};

const defaultFavicons: FaviconsProps = {
  icons: [
    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      href: '/favicons/apple-touch-icon.png',
      type: 'image/png',
    },
    {
      rel: 'icon',
      sizes: '32x32',
      href: '/favicons/favicon-32x32.png',
      type: 'image/png',
    },
    {
      rel: 'icon',
      sizes: '16x16',
      href: '/favicons/favicon-16x16.png',
      type: 'image/png',
    },
    {
      rel: 'shortcut icon',
      href: '/favicons/favicon.ico',
      type: 'image/x-icon',
    },
  ],
  browserconfig: '/favicons/browserconfig.xml',
};
