import { useMDXContent } from '@/hooks/useMDXContent';
import { OpenApiResponseExample } from '@/layouts/ApiSupplemental';
import { ApiPlayground } from '@/ui/ApiPlayground';

export const Api = () => {
  const [{ showApiPlayground, generatedRequestExamples, responseExample, pageMetadata }] =
    useMDXContent();

  return (
    <>
      {showApiPlayground && <ApiPlayground />}
      {generatedRequestExamples ? (
        <div className="block xl:hidden mt-8">{generatedRequestExamples}</div>
      ) : null}
      {!responseExample && pageMetadata.openapi && (
        <div className="block xl:hidden mt-8">
          <OpenApiResponseExample openapi={pageMetadata.openapi} />
        </div>
      )}
    </>
  );
};
