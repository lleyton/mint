import type { GetStaticPaths, GetStaticProps } from 'next';
import { MDXRemoteSerializeResult } from 'next-mdx-remote/dist/types';
import type { ParsedUrlQuery } from 'querystring';

import { getPage } from '@/lib/page';
import { getPaths } from '@/lib/paths';
import createSnippetTreeMap from '@/mdx/createSnippetTreeMap';
import getMdxSource from '@/mdx/getMdxSource';
import type { Config } from '@/types/config';
import { FaviconsProps } from '@/types/favicons';
import { Groups, PageMetaTags } from '@/types/metadata';
import { OpenApiFile } from '@/types/openApi';
import { PageProps } from '@/types/page';
import { Snippet } from '@/types/snippet';
import Page from '@/ui/Page';
import { pickRedirect } from '@/utils/staticProps/pickRedirect';
import { prepareToSerialize } from '@/utils/staticProps/prepareToSerialize';

interface PathProps extends ParsedUrlQuery {
  subdomain: string;
  slug: string[];
}

export const getStaticPaths: GetStaticPaths<PathProps> = async () => {
  if (!process.env.IS_MULTI_TENANT || process.env.IS_MULTI_TENANT === 'false') {
    return {
      paths: [],
      fallback: 'blocking',
    };
  }

  const data: Record<string, string[][]> = await getPaths();

  const paths = Object.entries(data).flatMap(
    ([subdomain, pathsForSubdomain]: [string, string[][]]) => {
      return pathsForSubdomain.map((pathForSubdomain) => ({
        params: { subdomain, slug: pathForSubdomain },
      }));
    }
  );
  return {
    paths,
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps<PageProps, PathProps> = async ({ params }) => {
  if (!process.env.IS_MULTI_TENANT || process.env.IS_MULTI_TENANT === 'false') {
    return {
      notFound: true,
    };
  }

  if (!params) throw new Error('No path parameters found');

  const { subdomain, slug } = params;
  const path = slug ? slug.join('/') : 'index';

  const { data, status } = await getPage(subdomain, path);

  // We put this check in case 200 status codes are sending invalid data.
  if (data == null) {
    throw 'Page data is missing at path: ' + path + ' for subdomain: ' + subdomain;
  }
  if (data.redirect) {
    const { navWithMetadata }: { navWithMetadata: Groups } = data;
    if (Array.isArray(navWithMetadata) && navWithMetadata.length > 0) {
      const { destination, permanent } = pickRedirect(navWithMetadata, path);
      if (destination) {
        return { redirect: { destination, permanent } };
      }
    }
    throw 'Could not find a page to redirect to at path: ' + path + ' for subdomain: ' + subdomain;
  }

  // The server providing data to static props only sends 400 and 403 when there is no data at all
  // for the subdomain.
  if (status === 400 || status === 403) {
    return {
      notFound: true,
    };
  }

  if (status === 200) {
    const {
      content,
      mintConfig,
      navWithMetadata,
      pageMetadata,
      openApiFiles,
      favicons,
      snippets,
    }: {
      content: string;
      mintConfig: Config;
      navWithMetadata: Groups;
      pageMetadata: PageMetaTags;
      openApiFiles?: OpenApiFile[];
      favicons: FaviconsProps;
      snippets: Snippet[];
    } = data;
    const snippetTreeMap = await createSnippetTreeMap(snippets ?? []);
    let mdxSource: MDXRemoteSerializeResult<Record<string, unknown>, Record<string, string>>;

    try {
      const response = await getMdxSource(
        content,
        {
          pageMetadata,
        },
        snippetTreeMap
      );
      mdxSource = response;
    } catch (err) {
      mdxSource = await getMdxSource(
        '🚧 A parsing error occured. Please contact the owner of this website. They can use the Mintlify CLI to test this website locally and see the errors that occur.',
        { pageMetadata }
      ); // placeholder content for when there is a syntax error.
      console.log(`⚠️ Warning: MDX failed to parse page ${path}: `, err);
    }

    return {
      props: prepareToSerialize({
        mdxSource,
        pageData: {
          navWithMetadata,
          pageMetadata,
          mintConfig,
          openApiFiles,
        },
        favicons,
        subdomain,
        internalAnalyticsWriteKey: process.env.INTERNAL_ANALYTICS_WRITE_KEY,
      }),
    };
  }
  return {
    notFound: true,
  };
};

export default Page;
