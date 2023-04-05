import { useEffect } from 'react';

import { MDXContentContextType } from '@/context/MDXContentContext';
import { MDXContentActionEnum } from '@/enums/MDXContentActionEnum';
import { useGetContentWidthCallback } from '@/hooks/useGetContentWidthCallback';

/**
 * Gets `contentWidth` and `isWideSize` and dispatches state update.
 */
export const useContentWidth = (ctx: MDXContentContextType) => {
  const [state, dispatch] = ctx;
  const { pageMetadata, responseExample, requestExample, isApi } = state;
  const getContentWidth = useGetContentWidthCallback();
  useEffect(() => {
    dispatch({
      type: MDXContentActionEnum.SET_CONTENT_WIDTH,
      payload: getContentWidth({
        pageMetadata,
        responseExample,
        requestExample,
        isApi,
      }),
    });
  }, [dispatch, getContentWidth, isApi, pageMetadata, requestExample, responseExample]);
  return [state, dispatch] as MDXContentContextType;
};
