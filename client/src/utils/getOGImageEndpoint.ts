import { Config } from '@/types/config';
import { PageMetaTags } from '@/types/metadata';

import { getTitle } from './getAllMetaTags';

export function getOGImageEndpoint(
  origin: string,
  pageMetadata: PageMetaTags,
  mintConfig: Config
): string {
  // Fallback to Mintlify's hosted endpoint for search engines that don't support JavaScript.
  const imageEndpoint = new URL(`${origin || 'https://mintlify.com/docs'}/api/og`);
  const titleParam = getTitle(pageMetadata);

  const setQueryParamIfExists = (param: string, value: string | undefined) => {
    if (value) {
      imageEndpoint.searchParams.set(param, value);
    }
  };

  setQueryParamIfExists('title', titleParam);
  setQueryParamIfExists(
    'description',
    pageMetadata.description || `${mintConfig.name} documentation`
  );

  if (typeof mintConfig.logo === 'string') {
    setQueryParamIfExists('logo', mintConfig.logo);
  }

  if (mintConfig.modeToggle?.default === 'dark') {
    imageEndpoint.searchParams.set('isDark', 'true');
    setQueryParamIfExists('leftGradientColor', mintConfig?.colors?.primary);
    setQueryParamIfExists('rightGradientColor', mintConfig?.colors?.light);
    setQueryParamIfExists('backgroundColor', mintConfig?.colors?.background?.dark || '#0F1117');

    if (typeof mintConfig.logo !== 'string') {
      setQueryParamIfExists('logo', mintConfig.logo?.dark);
    }

    return imageEndpoint.toString();
  }

  setQueryParamIfExists('leftGradientColor', mintConfig?.colors?.primary);
  setQueryParamIfExists('rightGradientColor', mintConfig?.colors?.primary);
  setQueryParamIfExists('backgroundColor', mintConfig?.colors?.background?.light || '#FFFFFF');

  if (typeof mintConfig.logo !== 'string') {
    setQueryParamIfExists('logo', mintConfig.logo?.light);
  }

  return imageEndpoint.toString();
}

const MAX_DESCRIPTION_CHARS = 105;

export const truncateThumbnailDescription = (description: string | null) => {
  if (!description || description.length < MAX_DESCRIPTION_CHARS) {
    return description;
  }

  if (description.includes('. ')) {
    return description.split('. ')[0];
  }

  return `${description?.substring(0, MAX_DESCRIPTION_CHARS)}...`;
};
