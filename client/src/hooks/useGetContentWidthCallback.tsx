import { useCallback } from 'react';

import { MDXContentState } from '@/types/mdxContentController';

export const useGetContentWidthCallback = () =>
  useCallback(
    (
      state: Pick<MDXContentState, 'pageMetadata' | 'responseExample' | 'requestExample' | 'isApi'>
    ) => {
      const { pageMetadata, responseExample, requestExample, isApi } = state;
      // The user can hide the table of contents by marking the size as wide, but the API
      // overrides that to show request and response examples on the side.
      // TODO: Remove meta.size
      const isWideSize = pageMetadata.mode === 'wide' || pageMetadata.size === 'wide';
      let contentWidth = 'max-w-3xl xl:max-w-[49rem]';
      if (isApi || requestExample || responseExample) {
        contentWidth = 'max-w-3xl xl:max-w-[min(100% - 31rem, 44rem)]';
      } else if (isWideSize) {
        contentWidth = 'max-w-3xl';
      }
      return { contentWidth, isWideSize };
    },
    []
  );
