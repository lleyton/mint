import { useContext } from 'react';

import AnalyticsContext from '@/analytics/AnalyticsContext';

export const useAnalyticsContext = (eventName: string) => {
  const { analyticsMediator } = useContext(AnalyticsContext);
  if (!analyticsMediator) return (_: object) => Promise.resolve();
  return analyticsMediator.createEventListener(eventName);
};
