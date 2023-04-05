import Router from 'next/router';
import { useState, useEffect } from 'react';

import AnalyticsMediator from '@/analytics/AnalyticsMediator';

/**
 * useAnalytics is the only way to create an AnalyticsMediator. Trying to create an
 * AnalyticsMediator without this hook will break because code like onRouteChange will
 * never be called.
 * @param analyticsConfig Config for each analytics implementation
 */
export function useAnalytics(
  analyticsConfig: AnalyticsMediatorConstructorInterface,
  subdomain?: string,
  internalAnalyticsWriteKey?: string
) {
  const [initializedAnalyticsMediator, setInitializedAnalyticsMediator] = useState(false);
  const [analyticsMediator, setAnalyticsMediator] = useState<
    AnalyticsMediatorInterface | undefined
  >();

  // AnalyticsMediator can only run in the browser
  // We use useEffect because it only runs on render
  useEffect(() => {
    if (!initializedAnalyticsMediator) {
      let internalAnalytics: { internalAnalyticsWriteKey: string; subdomain: string } | undefined =
        undefined;
      if (internalAnalyticsWriteKey && subdomain) {
        internalAnalytics = { internalAnalyticsWriteKey, subdomain };
      }
      const newMediator = new AnalyticsMediator(analyticsConfig, internalAnalytics);
      setAnalyticsMediator(newMediator);
      setInitializedAnalyticsMediator(true);
    }
  }, [initializedAnalyticsMediator, analyticsConfig, internalAnalyticsWriteKey, subdomain]);

  useEffect(() => {
    if (!analyticsMediator) {
      return;
    }
    analyticsMediator.onRouteChange(Router.asPath, { initialLoad: true });

    Router.events.on('routeChangeComplete', (url: string, routeProps: RouteProps) => {
      analyticsMediator.onRouteChange(url, routeProps);
    });
  }, [analyticsMediator]);

  return analyticsMediator;
}
