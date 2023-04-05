// TODO: Refactor this file to improve readability
import { Tab, Tabs } from '@mintlify/components';
import { useState, useContext } from 'react';
import ReactMarkdown from 'react-markdown';

import { Expandable } from '@/components/Expandable';
import { Heading } from '@/components/Heading';
import { ParamField } from '@/components/Param';
import { ResponseField } from '@/components/ResponseField';
import { ConfigContext } from '@/context/ConfigContext';
import { ApiComponent } from '@/ui/ApiPlayground';
import { getOpenApiOperationMethodAndEndpoint } from '@/utils/openApi/getOpenApiContext';
import { getParameterType } from '@/utils/openApi/getParameterType';
import {
  combineAllOfIntoObject,
  createExpandable,
  createParamField,
  getAllOpenApiParameters,
  getProperties,
  getTypeName,
} from '@/utils/openapi';

const MarkdownComponents = {
  p: (props: any) => <p className="m-0" {...props} />,
};

const getEnumDescription = (enumArray?: string[]): React.ReactNode | null => {
  if (enumArray == null || enumArray.length === 0) {
    return null;
  }
  return (
    <>
      Allowed values:{' '}
      {enumArray.map((val, i) => (
        <>
          <code>{val}</code>
          {i !== enumArray.length - 1 && ', '}
        </>
      ))}
    </>
  );
};

function ExpandableFields({ schema }: any) {
  const [expandedFields, setExpandedFields] = useState<Record<string, boolean>>({});
  if (schema == null) {
    return null;
  }

  if (schema.anyOf != null) {
    return (
      <Tabs>
        {schema.anyOf.map((schema: any, i: number) => (
          <Tab key={`${i + 1}`} title={`${i + 1}`}>
            {/* TODO: Explore whether properties can be assumed */}
            <ExpandableFields schema={{ properties: schema }} />
          </Tab>
        ))}
      </Tabs>
    );
  }

  if (schema.items) {
    const name = schema.items.title;
    return (
      <ResponseField name={name} type={schema.items.type}>
        <>
          <ReactMarkdown components={MarkdownComponents}>{schema.description}</ReactMarkdown>
          <Expandable
            title="properties"
            defaultOpen={false}
            onChange={(open) => {
              setExpandedFields({ ...expandedFields, [name]: open });
              return;
            }}
          >
            <ExpandableFields schema={schema.items} />
          </Expandable>
        </>
      </ResponseField>
    );
  }

  // TBD: Cleanup response field by types
  return (
    <>
      {schema.properties &&
        Object.entries(schema.properties)
          ?.sort(([propertyLeft], [propertyRight]) => {
            // Brings all required to the top
            return schema.required?.includes(propertyLeft)
              ? -1
              : schema.required?.includes(propertyRight)
              ? 1
              : 0;
          })
          .map(([property, value]: any) => {
            if (value == null) {
              return null;
            }

            const isArrayExpandable = Boolean(value.items && value.items.properties == null);
            const type =
              isArrayExpandable && value.items.type
                ? `${value.items.type}[]`
                : getTypeName(value.type);
            return (
              <ResponseField
                key={property}
                name={property}
                required={schema.required?.includes(property)}
                type={type}
              >
                {/* Is array nested */}
                {value.items && !isArrayExpandable ? (
                  <div className="mt-2">
                    <ReactMarkdown components={MarkdownComponents}>
                      {value.description}
                    </ReactMarkdown>
                    <Expandable
                      title={value.items.type || 'properties'}
                      onChange={(open) => {
                        setExpandedFields({ ...expandedFields, [property]: open });
                        return;
                      }}
                    >
                      <ExpandableFields schema={value.items} />
                    </Expandable>
                  </div>
                ) : (
                  <>
                    <ReactMarkdown components={MarkdownComponents}>
                      {value.description || value.title || getEnumDescription(value.enum)}
                    </ReactMarkdown>
                    {value.properties && (
                      <div className="mt-2">
                        <Expandable
                          title={value.type || 'properties'}
                          onChange={(open) => {
                            setExpandedFields({ ...expandedFields, [property]: open });
                            return;
                          }}
                        >
                          <ExpandableFields schema={value}></ExpandableFields>
                        </Expandable>
                      </div>
                    )}
                    {value.allOf && (
                      <Expandable title="properties">
                        <ExpandableFields
                          schema={combineAllOfIntoObject(value.allOf)}
                        ></ExpandableFields>
                      </Expandable>
                    )}
                    {value.items?.allOf && (
                      <Expandable title="properties">
                        <ExpandableFields
                          schema={combineAllOfIntoObject(value.items.allOf)}
                        ></ExpandableFields>
                      </Expandable>
                    )}
                    {value.enum && Array.isArray(value.enum) && (
                      <div className="whitespace-pre-wrap">
                        Available options:{' '}
                        {value.enum.map((enumValue: string, i: number) => (
                          <>
                            <code>{enumValue}</code>
                            {i !== value.enum.length - 1 && ','}{' '}
                          </>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </ResponseField>
            );
          })}
    </>
  );
}

export function OpenApiParameters({ endpointStr }: { endpointStr: string }) {
  const { openApiFiles } = useContext(ConfigContext);
  const { operation, path } = getOpenApiOperationMethodAndEndpoint(endpointStr, openApiFiles);

  if (operation == null) {
    return null;
  }

  const apiComponents: ApiComponent[] = [];

  const parameters = getAllOpenApiParameters(path, operation);
  const Parameters = parameters.map((parameter: any, i: number) => {
    const { name, description, required, schema, in: paramType } = parameter;
    const paramName = { [paramType]: name };
    const type = schema == null ? parameter?.type : getParameterType(schema);
    return (
      <ParamField
        key={i}
        {...paramName}
        required={required}
        type={type}
        default={schema?.default}
        enum={schema?.enum}
      >
        <ReactMarkdown components={MarkdownComponents}>
          {description || schema?.description || schema?.title}
        </ReactMarkdown>
      </ParamField>
    );
  });

  const bodyContent = operation.requestBody?.content;
  const contentType = bodyContent && Object.keys(bodyContent)[0];
  let bodySchema = bodyContent && bodyContent[contentType]?.schema;

  if (bodySchema?.allOf) {
    bodySchema = combineAllOfIntoObject(bodySchema.allOf);
  }

  const Body =
    bodySchema?.properties &&
    Object.entries(bodySchema.properties)?.map(([property, propertyValue]: any, i: number) => {
      const required = bodySchema.required?.includes(property);
      const type = getParameterType(propertyValue);
      const bodyDefault = bodySchema.example
        ? JSON.stringify(bodySchema.example[property])
        : undefined;
      const last = i + 1 === operation.parameters?.length;
      let children;
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
      return (
        <ParamField
          key={i}
          body={property}
          required={required}
          type={type}
          default={bodyDefault}
          enum={propertyValue.enum}
          last={last}
        >
          <ReactMarkdown components={MarkdownComponents}>
            {propertyValue.description || propertyValue.title}
          </ReactMarkdown>
        </ParamField>
      );
    });

  const responseSchema = operation.responses?.['200']?.content?.['application/json']?.schema;

  return (
    <div>
      {Parameters?.length > 0 && (
        <>
          <Heading level={3} id="parameters">
            Parameters
          </Heading>
          {Parameters}
        </>
      )}
      {Body?.length > 0 && (
        <>
          <Heading level={3} id="body">
            Body
          </Heading>
          <ExpandableFields schema={bodySchema} />
        </>
      )}
      {responseSchema && (
        <>
          <Heading level={3} id="response">
            Response
          </Heading>
          <ExpandableFields schema={responseSchema} />
        </>
      )}
    </div>
  );
}
