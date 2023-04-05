import { MDXProvider } from '@mdx-js/react';
import { ReactNode } from 'react';

import { DynamicLink } from '@/components/DynamicLink';
import { Heading } from '@/components/Heading';
import { useMDXContent } from '@/hooks/useMDXContent';
import { OpenApiParameters } from '@/layouts/OpenApiParameters';

export const Content = ({ children }: { children: ReactNode }) => {
  const [{ pageMetadata }] = useMDXContent();
  /* The MDXProvider here renders the MDX for the page */
  return (
    <div className="relative prose prose-slate mt-8 dark:prose-dark">
      <MDXProvider components={{ a: DynamicLink, Heading }}>{children}</MDXProvider>
      {pageMetadata.openapi && <OpenApiParameters endpointStr={pageMetadata.openapi} />}
    </div>
  );
};
