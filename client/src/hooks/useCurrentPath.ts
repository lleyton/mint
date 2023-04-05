import { useRouter } from 'next/router';
import { useContext } from 'react';

import { ConfigContext } from '@/context/ConfigContext';

/**
 * @returns Path with a leading slash, after removing the /_sites/{subdomain} the middleware rewrites.
 */
export function useCurrentPath() {
  const router = useRouter();
  const { subdomain } = useContext(ConfigContext);
  const withOutBasePathRemoval = '/_sites/' + subdomain;
  const withBasePathRemoval = router.basePath + withOutBasePathRemoval;

  if (router.asPath.startsWith(withOutBasePathRemoval)) {
    return router.asPath.substring(withOutBasePathRemoval.length).split('#')[0];
  }
  if (router.asPath.startsWith(withBasePathRemoval)) {
    return router.asPath.substring(withBasePathRemoval.length).split('#')[0];
  }

  return router.asPath.split('#')[0];
}
