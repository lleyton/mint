import { AnalyticsService } from '@/analytics/AnalyticsService';

export default class FathomAnalytics extends AnalyticsService {
  initialized = false;
  trackPageview: any;

  init(implementationConfig: ConfigInterface) {
    if (!implementationConfig.siteId || process.env.NODE_ENV !== 'production') {
      return;
    }

    const { siteId } = implementationConfig;

    import('fathom-client')
      .then((_fathom) => {
        if (!this.initialized) {
          _fathom.load(siteId);

          // The Fathom library uses asterisk imports (ie. * as Fathom)
          // so there is no default export for us to store a reference to.
          // Instead, we keep a reference to the method we need.
          this.trackPageview = _fathom.trackPageview;

          this.initialized = true;
        }
      })
      .catch((e) => {
        console.error(e);
      });
  }

  createEventListener(_: string): (eventProperties: object) => Promise<void> {
    return () => Promise.resolve();
  }

  onRouteChange(_: string, routeProps: any) {
    if (this.trackPageview && !routeProps.shallow) {
      this.trackPageview();
    }
  }
}
