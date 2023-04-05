import { useCallback } from 'react';

import { MDXContentState } from '@/types/mdxContentController';
import { getParamGroupsFromApiComponents } from '@/utils/api';

export const useParamGroupsCallback = () =>
  useCallback(
    (
      state: Pick<
        MDXContentState,
        'openApiPlaygroundProps' | 'apiComponents' | 'mintConfig' | 'pageMetadata'
      >
    ) => {
      const { pageMetadata, openApiPlaygroundProps, apiComponents, mintConfig } = state;
      const paramGroupDict = getParamGroupsFromApiComponents(
        openApiPlaygroundProps?.apiComponents ?? apiComponents,
        pageMetadata.authMethod || mintConfig?.api?.auth?.method,
        mintConfig?.api?.auth?.name
      );
      const paramGroups = Object.entries(paramGroupDict).map(([groupName, params]) => {
        return {
          name: groupName,
          params,
        };
      });
      return { paramGroupDict, paramGroups };
    },
    []
  );
