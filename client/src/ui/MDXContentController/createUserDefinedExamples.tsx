import { ReactNode } from 'react';

import { CodeBlock } from '@/components/CodeBlock';
import { CodeGroup } from '@/components/CodeGroup';
import { Component } from '@/enums/components';
import { ApiComponent } from '@/types/apiComponent';
import { htmlToReactComponent } from '@/utils/htmlToReactComponent';

// The RequestExample and ResponseExample classes are hidden on large screens, so we need to re-assemble them here.
export function createUserDefinedExamples(apiComponents: ApiComponent[]) {
  const requestComponentSkeleton = apiComponents.find((apiComponent) => {
    return apiComponent.type === Component.RequestExample;
  });

  const responseComponentSkeleton = apiComponents.find((apiComponent) => {
    return apiComponent.type === Component.ResponseExample;
  });

  let requestExample: ReactNode | undefined = undefined;
  let responseExample: ReactNode | undefined = undefined;
  // Create Request Example
  if (requestComponentSkeleton) {
    requestExample = (
      <CodeGroup isSmallText>
        {requestComponentSkeleton.children?.map((child, i) => {
          return (
            <CodeBlock filename={child.filename} key={(child.filename ?? '') + i}>
              {htmlToReactComponent(child.html ?? '')}
            </CodeBlock>
          );
        })}
      </CodeGroup>
    );
  }

  // Create ResponseExample
  if (responseComponentSkeleton) {
    responseExample = (
      <CodeGroup isSmallText>
        {responseComponentSkeleton.children?.map((child, i) => {
          return (
            <CodeBlock filename={child.filename} key={(child.filename ?? '') + i}>
              {htmlToReactComponent(child.html ?? '')}
            </CodeBlock>
          );
        })}
      </CodeGroup>
    );
  }

  return { requestExample, responseExample };
}
