import { ApiPlayground as GenericApiPlayground, RequestPathHeader } from '@mintlify/components';
import { RequestMethods } from '@mintlify/components/dist/Api/types';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState, useContext } from 'react';

import { ConfigContext } from '@/context/ConfigContext';
import { Event } from '@/enums/events';
import { useAnalyticsContext } from '@/hooks/useAnalyticsContext';
import { useMDXContent } from '@/hooks/useMDXContent';
import { useSetApiBaseIndexCallback } from '@/hooks/useSetApiBaseIndexCallback';
import { useSetApiPlaygroundInputsCallback } from '@/hooks/useSetApiPlaygroundInputsCallback';
import { ApiComponent as ApiComponentType } from '@/types/apiComponent';
import { extractBaseAndPath, extractMethodAndEndpoint, getApiContext } from '@/utils/api';
import { getAuthParamName } from '@/utils/apiExampleGeneration/getAuthParamName';

export type ApiComponent = ApiComponentType & {
  name?: string;
  attributes?: {
    type: string;
    name: string;
    value: string;
  }[];
};

export const APIBASE_CONFIG_STORAGE = 'apiBaseIndex';

// Be careful changing the prop types. The parameter is exported. In those cases,
// users set api and paramGroups but not the other fields.
export function ApiPlayground() {
  const { basePath } = useRouter();
  const { mintConfig, openApiFiles } = useContext(ConfigContext);
  const [apiBaseIndex, setApiBaseIndex] = useState(0);
  const trackApiPlaygroundCall = useAnalyticsContext(Event.APIPlaygroundCall);

  const [{ openApiPlaygroundProps, pageMetadata, api, paramGroups }] = useMDXContent();

  const contentType = openApiPlaygroundProps.contentType ?? pageMetadata.contentType;

  const onApiBaseIndexChange = useSetApiBaseIndexCallback();
  const onInputDataChange = useSetApiPlaygroundInputsCallback();

  const { method, endpoint } = extractMethodAndEndpoint(api);

  let base = '';
  let path = '';
  try {
    const extracted = extractBaseAndPath(
      endpoint,
      apiBaseIndex,
      mintConfig?.api?.baseUrl,
      openApiFiles
    );
    base = extracted.base;
    path = extracted.path;
  } catch (e) {
    // Invalid URL. Keep the default empty strings.
  }

  const [apiBase, setApiBase] = useState<string>(base);
  const [isSendingRequest, setIsSendingResponse] = useState<boolean>(false);
  const authParamName = getAuthParamName(
    mintConfig?.api?.auth?.name,
    mintConfig?.api?.auth?.method
  );
  const setAuthPrefix = mintConfig?.api?.auth?.inputPrefix && authParamName;
  const [inputData, setInputData] = useState<Record<string, object>>(
    setAuthPrefix
      ? {
          Authorization: {
            [authParamName]: mintConfig.api?.auth?.inputPrefix,
          },
        }
      : {}
  );
  const [apiResponse, setApiResponse] = useState<string>();

  useEffect(() => {
    const configuredApiBaseIndex = window.localStorage.getItem(APIBASE_CONFIG_STORAGE);
    if (configuredApiBaseIndex != null) {
      const storedApiBaseIndex = parseInt(configuredApiBaseIndex, 10);
      setApiBaseIndex(storedApiBaseIndex);
      if (onApiBaseIndexChange) {
        onApiBaseIndexChange(storedApiBaseIndex);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api]);

  const onChangeApiBaseSelection = (base: string) => {
    if (mintConfig?.api == null || !Array.isArray(mintConfig.api?.baseUrl)) {
      return;
    }
    const index = mintConfig.api.baseUrl.indexOf(base);
    if (index >= 0) {
      window.localStorage.setItem(APIBASE_CONFIG_STORAGE, index.toString());
      setApiBase(base);
      if (onApiBaseIndexChange) {
        onApiBaseIndexChange(index);
      }
    }
  };

  const makeApiRequest = async () => {
    setIsSendingResponse(true);
    try {
      const apiContext = getApiContext(apiBase, path, inputData, contentType, mintConfig?.api);
      const { data } = await axios.post(`${basePath || ''}/api/request`, {
        method,
        ...apiContext,
      });

      trackApiPlaygroundCall({
        request: {
          method,
          ...apiContext,
        },
        response: data.response,
      });

      setApiResponse(data.highlightedJson);
    } catch (error: unknown) {
      setApiResponse(
        (
          error as {
            highlightedJson: string;
          }
        ).highlightedJson
      );
    } finally {
      setIsSendingResponse(false);
    }
  };

  if (!method) {
    return <p>Missing request method in API definition.</p>;
  }

  return (
    <GenericApiPlayground
      method={method as RequestMethods}
      paramGroups={paramGroups}
      paramValues={inputData}
      isSendingRequest={isSendingRequest}
      onChangeParamValues={(newInputs) => {
        setInputData(newInputs);
        if (onInputDataChange) {
          onInputDataChange(newInputs);
        }
      }}
      onSendRequest={makeApiRequest}
      header={
        <RequestPathHeader
          method={method as RequestMethods}
          baseUrls={Array.isArray(mintConfig?.api?.baseUrl) ? mintConfig?.api?.baseUrl : undefined}
          defaultBaseUrl={
            Array.isArray(mintConfig?.api?.baseUrl) ? mintConfig?.api?.baseUrl[0] : undefined
          }
          onBaseUrlChange={onChangeApiBaseSelection}
          path={path}
        />
      }
      response={
        apiResponse ? (
          <div className="py-3 px-3 max-h-60 whitespace-pre overflow-scroll border-t border-slate-200 dark:border-slate-700  dark:text-slate-300 font-mono text-xs leading-5">
            <span
              className="language-json max-h-72 overflow-scroll"
              dangerouslySetInnerHTML={{
                __html: apiResponse,
              }}
            />
          </div>
        ) : undefined
      }
    />
  );
}
