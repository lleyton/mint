import { Accordion as GenericAccordion } from '@mintlify/components';
import { ReactNode } from 'react';

import { Event } from '@/enums/events';
import { useAnalyticsContext } from '@/hooks/useAnalyticsContext';
import { IconType } from '@/types/config';
import { ComponentIcon } from '@/ui/Icon';

function Accordion({
  title,
  description,
  defaultOpen = false,
  icon,
  iconType,
  children,
}: {
  title: string;
  description?: string;
  defaultOpen: boolean;
  icon?: ReactNode | string;
  iconType?: IconType;
  children: ReactNode;
}) {
  const trackOpen = useAnalyticsContext(Event.AccordionOpen);
  const trackClose = useAnalyticsContext(Event.AccordionClose);

  const onChange = (open: boolean) => {
    if (open) {
      trackOpen({ title });
    } else {
      trackClose({ title });
    }
  };

  const Icon =
    typeof icon === 'string' ? (
      <ComponentIcon icon={icon} iconType={iconType} className="w-4 h-4" />
    ) : (
      icon
    );

  return (
    <GenericAccordion
      title={title}
      description={description}
      defaultOpen={defaultOpen}
      onChange={onChange}
      icon={Icon}
    >
      {children}
    </GenericAccordion>
  );
}

export default Accordion;
