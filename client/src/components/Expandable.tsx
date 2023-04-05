import { Expandable as GenericExpandable } from '@mintlify/components';
import { ReactNode } from 'react';

import { useAnalyticsContext } from '@/hooks/useAnalyticsContext';

export function Expandable({
  title,
  defaultOpen = false,
  onChange: onChangeProp,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  onChange?: (open: boolean) => void;
  children: ReactNode;
}) {
  const openAnalyticsListener = useAnalyticsContext('expandable_open');
  const closeAnalyticsListener = useAnalyticsContext('expandable_close');

  const onChange = (open: boolean) => {
    if (onChangeProp) {
      onChangeProp(open);
    }

    if (open) {
      openAnalyticsListener({ title });
    } else {
      closeAnalyticsListener({ title });
    }
  };

  return (
    <GenericExpandable title={title} onChange={onChange} defaultOpen={defaultOpen}>
      {children}
    </GenericExpandable>
  );
}
