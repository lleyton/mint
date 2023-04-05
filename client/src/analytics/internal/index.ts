import posthog from 'posthog-js';

import PostHogAnalytics from '../services/posthog';

export default class InternalAnalytics extends PostHogAnalytics {
  initialized = false;
  subdomain: string;

  constructor(subdomain: string) {
    super();
    this.subdomain = subdomain;
  }

  captureEvent(eventName: string) {
    return async (eventProperties: object) => {
      posthog.capture(eventName, {
        ...eventProperties,
        subdomain: this.subdomain,
      });
    };
  }

  onRouteChange(_url: string, _routeProps: RouteProps): void {
    posthog.capture('$pageview', { subdomain: this.subdomain });
  }
}
