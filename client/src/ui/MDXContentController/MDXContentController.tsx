import { ReactNode } from 'react';

import { MDXContentContext } from '@/context/MDXContentContext';
import { useMDXContentController } from '@/hooks/useMDXContentController';
import { ApiComponent } from '@/types/apiComponent';
import { PageMetaTags } from '@/types/metadata';
import { TableOfContentsSection } from '@/types/tableOfContentsSection';

import { Api } from './Api';
import { Container } from './Container';
import { Content } from './Content';
import { Footer } from './Footer';
import { Header } from './Header';

export type MDXContentControllerProps = {
  children: ReactNode;
  pageMetadata: PageMetaTags;
  tableOfContents: TableOfContentsSection[];
  apiComponents: ApiComponent[];
};

export function MDXContentController({ children, ...props }: MDXContentControllerProps) {
  const ctx = useMDXContentController(props);
  return (
    <MDXContentContext.Provider value={ctx}>
      <Container>
        <Header />
        <Api />
        <Content>{children}</Content>
        <Footer />
      </Container>
    </MDXContentContext.Provider>
  );
}
