import { useMDXContent } from '@/hooks/useMDXContent';
import { OpenApiResponseExample } from '@/layouts/ApiSupplemental';
import { ContentSideLayout } from '@/layouts/ContentSideLayout';
import { BlogContext } from '@/ui/Blog';
import { TableOfContents } from '@/ui/MDXContentController/TableOfContents';

export const SidePanel = () => {
  const [
    {
      isWideSize,
      isApi,
      requestExample,
      responseExample,
      generatedRequestExamples,
      pageMetadata,
      isBlogMode,
      currentTableOfContentsSection,
      tableOfContents,
    },
  ] = useMDXContent();
  return !isWideSize ? (
    isApi || requestExample || responseExample ? (
      <ContentSideLayout sticky>
        <div className="space-y-6 pb-6 w-[28rem]">
          {requestExample}
          {generatedRequestExamples}
          {responseExample}
          {!responseExample && pageMetadata.openapi && (
            <OpenApiResponseExample openapi={pageMetadata.openapi} />
          )}
        </div>
      </ContentSideLayout>
    ) : isBlogMode ? (
      <BlogContext />
    ) : (
      <TableOfContents
        tableOfContents={tableOfContents}
        currentSection={currentTableOfContentsSection}
        meta={pageMetadata}
      />
    )
  ) : null;
};
