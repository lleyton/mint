import { Component } from '@/enums/components';

export const createParamField = (
  attributes: Record<string, any>,
  children?: {
    name: Component;
    children: any;
  }[]
) => {
  const attributesArray = Object.entries(attributes).map(([key, value]) => {
    return {
      type: 'mdx',
      name: key,
      value,
    };
  });
  return {
    type: Component.ParamField,
    attributes: attributesArray,
    children,
  };
};

export const createExpandable = (children: any) => {
  return {
    name: Component.Expandable,
    children,
  };
};

export const getProperties = (properties: any[]): any[] => {
  return Object.entries(properties).map(([property, propertyValue]: any) => {
    let children;
    if (propertyValue.properties) {
      const nestedProperties = getProperties(propertyValue.properties);
      children = [createExpandable(nestedProperties)];
    }
    return createParamField(
      {
        body: property,
        ...propertyValue,
      },
      children
    );
  });
};

export const getAllOpenApiParameters = (path: any, operation: any) => {
  return (path.parameters || []).concat(operation.parameters || []);
};

export const getTypeName = (type: string[] | string) => {
  return Array.isArray(type) ? type.join(' | ') : type;
};

export const combineAllOfIntoObject = (allOf: any[]) => {
  let combinedProperties = {};
  let combinedRequired: string[] = [];
  let combinedExample = {};
  allOf.forEach((item) => {
    if (item.properties) {
      combinedProperties = { ...combinedProperties, ...item.properties };
    }
    if (item.required) {
      combinedRequired = [...combinedRequired, ...item.required];
    }
    if (item.example) {
      combinedExample = { ...combinedExample, ...item.example };
    }
  });

  const combinedObject = {
    type: 'object',
    properties: combinedProperties,
    required: combinedRequired,
    example: combinedExample,
  };

  return combinedObject;
};
