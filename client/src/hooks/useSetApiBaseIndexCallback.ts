import { useCallback } from 'react';

import { MDXContentActionEnum } from '@/enums/MDXContentActionEnum';
import { useMDXContent } from '@/hooks/useMDXContent';

export const useSetApiBaseIndexCallback = () => {
  const [, dispatch] = useMDXContent();
  return useCallback(
    (x: number) =>
      dispatch({
        type: MDXContentActionEnum.SET_API_BASE_INDEX,
        payload: x,
      }),
    [dispatch]
  );
};
