import { useCallback } from 'react';

import { MDXContentActionEnum } from '@/enums/MDXContentActionEnum';
import { useMDXContent } from '@/hooks/useMDXContent';

export const useSetApiPlaygroundInputsCallback = <T = unknown>() => {
  const [, dispatch] = useMDXContent();
  return useCallback(
    (x: Record<string, T>) =>
      dispatch({
        type: MDXContentActionEnum.SET_API_PLAYGROUND_INPUTS,
        payload: x,
      }),
    [dispatch]
  );
};
