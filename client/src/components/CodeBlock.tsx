import { CodeBlock as GenericCodeBlock } from '@mintlify/components';
import { ReactNode } from 'react';

import { Event } from '@/enums/events';
import { useAnalyticsContext } from '@/hooks/useAnalyticsContext';
import { useColors } from '@/hooks/useColors';

export function CodeBlock({ filename, children }: { filename?: string; children?: ReactNode }) {
  const colors = useColors();
  const trackCodeBlockCopy = useAnalyticsContext(Event.CodeBlockCopy);

  return (
    <GenericCodeBlock
      filename={filename}
      filenameColor={colors.primaryLight}
      tooltipColor={colors.primaryDark}
      onCopied={(_, textToCopy) => trackCodeBlockCopy({ code: textToCopy })}
    >
      {children}
    </GenericCodeBlock>
  );
}
