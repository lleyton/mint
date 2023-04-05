import { ReactNode, useCallback } from 'react';

import { GeneratedRequestExamples } from '@/layouts/ApiSupplemental';
import { MDXContentState } from '@/types/mdxContentController';

export const useApiPlaygroundCallback = () =>
  useCallback(
    (
      state: Pick<
        MDXContentState,
        | 'isApi'
        | 'openApiPlaygroundProps'
        | 'pageMetadata'
        | 'requestExample'
        | 'paramGroupDict'
        | 'apiPlaygroundInputs'
        | 'apiBaseIndex'
        | 'mintConfig'
      >
    ) => {
      const {
        isApi,
        openApiPlaygroundProps,
        apiPlaygroundInputs,
        apiBaseIndex,
        paramGroupDict,
        requestExample,
        pageMetadata,
        mintConfig,
      } = state;
      // TODO - make this undefined when nothing exists
      const api = openApiPlaygroundProps?.api ?? pageMetadata.api ?? '';
      const showApiPlayground = isApi && !mintConfig?.api?.hidePlayground;
      let generatedRequestExamples: ReactNode = null;
      if (!requestExample && api !== '' && showApiPlayground) {
        generatedRequestExamples = (
          <GeneratedRequestExamples
            paramGroupDict={paramGroupDict}
            apiPlaygroundInputs={apiPlaygroundInputs}
            apiBaseIndex={apiBaseIndex}
            endpointStr={api}
          />
        );
      }
      return { showApiPlayground, api, generatedRequestExamples };
    },
    []
  );
