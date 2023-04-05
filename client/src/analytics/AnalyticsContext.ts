import { createContext } from 'react';

const AnalyticsContext = createContext({
  analyticsMediator: undefined,
} as {
  analyticsMediator: AnalyticsMediatorInterface | undefined;
});
export default AnalyticsContext;
