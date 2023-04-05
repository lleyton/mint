import { Component } from '@/enums/components';
import { Config } from '@/types/config';
import { OpenApiFile } from '@/types/openApi';
import { ApiComponent } from '@/ui/ApiPlayground';
import { getOpenApiOperationMethodAndEndpoint } from '@/utils/openApi/getOpenApiContext';
import { getParameterType } from '@/utils/openApi/getParameterType';
import {
  combineAllOfIntoObject,
  createExpandable,
  createParamField,
  getAllOpenApiParameters,
  getProperties,
} from '@/utils/openapi';

export type OpenApiPlaygroundProps = {
  apiComponents?: ApiComponent[];
  api?: string;
  contentType?: any;
};

export function getOpenApiPlaygroundProps(
  apiBaseIndex: number,
  mintConfig: Config | undefined,
  openApiFiles: OpenApiFile[],
  openApiEndpoint: string | undefined
): OpenApiPlaygroundProps {
  // Detect when OpenAPI is missing
  if (!openApiEndpoint || !openApiFiles) {
    return {};
  }

  const { method, endpoint, operation, path } = getOpenApiOperationMethodAndEndpoint(
    openApiEndpoint,
    openApiFiles
  );

  // Detect when OpenAPI string is missing the operation (eg. GET)
  if (!operation) {
    return {};
  }

  // Get the api string with the correct baseUrl
  // endpoint in OpenAPI refers to the path
  const openApiServers = openApiFiles?.reduce((acc, file) => {
    return acc.concat(file.spec?.servers);
  }, []);
  const configBaseUrl =
    mintConfig?.api?.baseUrl ??
    openApiServers?.map((server: { url: string } | undefined) => server?.url);
  const baseUrl =
    configBaseUrl && Array.isArray(configBaseUrl) ? configBaseUrl[apiBaseIndex] : configBaseUrl;
  const api = `${method} ${baseUrl}${endpoint}`;

  // Get ApiComponents to show in the ApiPlayground
  const parameters = getAllOpenApiParameters(path, operation);
  const apiComponents: ApiComponent[] = [];

  // Get the Parameter ApiComponents
  parameters.forEach((parameter: any) => {
    const { name, required, schema, in: paramType, example } = parameter;
    const type = schema == null ? parameter?.type : getParameterType(schema);
    const paramField = createParamField({
      [paramType]: name,
      required,
      type,
      default: schema?.default,
      placeholder: example || schema?.enum,
    });
    apiComponents.push(paramField);
  });

  const bodyContent = operation.requestBody?.content;
  const contentType = bodyContent && Object.keys(bodyContent)[0];
  let bodySchema = bodyContent && bodyContent[contentType]?.schema;
  if (bodySchema?.allOf) {
    bodySchema = combineAllOfIntoObject(bodySchema.allOf);
  }

  // Get the Body ApiComponents
  if (bodySchema?.properties) {
    Object.entries(bodySchema.properties)?.forEach(([property, propertyValue]: any, i: number) => {
      const required = bodySchema.required?.includes(property);
      const type = getParameterType(propertyValue);
      const bodyDefault = bodySchema.example
        ? JSON.stringify(bodySchema.example[property])
        : undefined;
      const last = i + 1 === operation.parameters?.length;
      let children:
        | {
            name: Component;
            children: any;
          }[]
        | undefined;
      if (propertyValue.properties) {
        const properties = getProperties(propertyValue.properties);
        children = [createExpandable(properties)];
      } else if (propertyValue.items?.properties) {
        const properties = getProperties(propertyValue.items.properties);
        children = [createExpandable(properties)];
      }
      const paramField = createParamField(
        {
          body: property,
          required,
          type,
          default: bodyDefault,
          enum: propertyValue.enum,
          last,
        },
        children
      );
      apiComponents.push(paramField);
    });
  }

  return {
    api,
    apiComponents,
    contentType,
  };
}
