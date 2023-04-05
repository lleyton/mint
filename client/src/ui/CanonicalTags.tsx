import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import { useCurrentPath } from '@/hooks/useCurrentPath';

export const CanonicalTags = () => {
  const router = useRouter();
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const currentUrl = origin + router.basePath + useCurrentPath();

  return (
    <Head>
      <meta key="og:url" name="og:url" content={currentUrl} />
      <link rel="canonical" href={currentUrl} />
    </Head>
  );
};
