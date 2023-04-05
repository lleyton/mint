import posthog from 'posthog-js';

import { AnalyticsService } from '@/analytics/AnalyticsService';

export default class PostHogAnalytics extends AnalyticsService {
  initialized = false;

  init(implementationConfig: ConfigInterface) {
    if (!implementationConfig.apiKey || process.env.NODE_ENV !== 'production') {
      return;
    }

    this.initialized = true;
    // apiHost only has to be passed in if the user is self-hosting PostHog
    posthog.init(implementationConfig.apiKey, {
      api_host: implementationConfig.apiHost || 'https://app.posthog.com',
      capture_pageview: false, // disable default pageview
      loaded: (posthogInstance) => {
        if (process.env.NODE_ENV !== 'production') posthogInstance.opt_out_capturing();
      },
    });
  }

  captureEvent(eventName: string) {
    return async (eventProperties: object) => {
      posthog.capture(eventName, {
        ...eventProperties,
      });
    };
  }

  createEventListener(eventName: string) {
    if (this.initialized) {
      return this.captureEvent(eventName);
    }
    return async function doNothing(_: object) {
      return;
    };
  }

  onRouteChange(_url: string, _routeProps: RouteProps): void {
    posthog.capture('$pageview');
  }
}
