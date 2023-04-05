import { Config } from '@/types/config';
import { PageMetaTags } from '@/types/metadata';

import { slugToTitle } from './titleText/slugToTitle';

// Everything here gets injected as metatags when available.
// og:url is a special case handled in SupremePageLayout
const SEO_META_TAGS = [
  'description',
  'og:site_name',
  'og:title',
  'og:description',
  'og:image',
  'og:locale',
  'og:logo',
  'article:publisher',
  'twitter:title',
  'twitter:description',
  'twitter:url',
  'twitter:image',
  'twitter:site',
  'og:image:width',
  'og:image:height',
];

export function getAllMetaTags(pageMeta: PageMetaTags, config: Config, imageEndpoint: string) {
  const configMetadata = config.metadata || {};

  const allMeta = {
    charset: 'utf-8',
    'og:type': 'website',
    'og:site_name': config.name,
    'twitter:card': 'summary_large_image',
    'og:title': defaultTitle(pageMeta, config.name),
    'twitter:title': defaultTitle(pageMeta, config.name),
    'og:image': imageEndpoint,
    'twitter:image': imageEndpoint,
  } as { [key: string]: string };

  if (pageMeta.description) {
    // Default value, overriden in the loop below if og:description is set
    allMeta['og:description'] = pageMeta.description;
  }

  SEO_META_TAGS.forEach((tagName) => {
    const metaValue = pageMeta[tagName] ?? configMetadata[tagName];
    if (metaValue) {
      allMeta[tagName] = metaValue;
    }
  });

  return allMeta;
}

export function getTitle(pageMeta: PageMetaTags): string {
  return pageMeta.title || pageMeta.sidebarTitle || slugToTitle(pageMeta.href || '');
}

export function getSidebarTitle(pageMeta: PageMetaTags): string {
  return pageMeta.sidebarTitle || pageMeta.title || slugToTitle(pageMeta.href || '');
}

function defaultTitle(pageMeta: PageMetaTags, siteName: string) {
  const title = getTitle(pageMeta);
  if (title && siteName) {
    return title + ' - ' + siteName;
  } else if (siteName) {
    return siteName;
  }
  return title;
}
