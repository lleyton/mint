import { useMDXContent } from '@/hooks/useMDXContent';
import { BlogHeader, PageHeader } from '@/ui/MDXContentController/PageHeader';
import { getSectionTitle } from '@/utils/paths/getSectionTitle';

export const Header = () => {
  const [{ currentPath, mintConfig, pageMetadata, isBlogMode }] = useMDXContent();
  return isBlogMode ? (
    <BlogHeader pageMetadata={pageMetadata} />
  ) : (
    <PageHeader
      pageMetadata={pageMetadata}
      section={getSectionTitle(currentPath, mintConfig?.navigation ?? [])}
    />
  );
};
