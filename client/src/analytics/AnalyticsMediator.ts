import { AnalyticsService } from '@/analytics/AnalyticsService';
import PostHogAnalytics from '@/analytics/services/posthog';

import InternalAnalytics from './internal';
import AmplitudeAnalytics from './services/amplitude';
import FathomAnalytics from './services/fathom';
import GA4Analytics from './services/ga4';
import HotjarAnalytics from './services/hotjar';
import LogrocketAnalytics from './services/logrocket';
import MixpanelAnalytics from './services/mixpanel';
import PirschAnalytics from './services/pirsch';
import SegmentAnalytics from './services/segment';

export default class AnalyticsMediator implements AnalyticsMediatorInterface {
  analyticsIntegrations: AnalyticsService[] = [];

  constructor(
    analytics?: AnalyticsMediatorConstructorInterface,
    internalAnalytics?: { internalAnalyticsWriteKey: string; subdomain: string }
  ) {
    if (internalAnalytics) {
      const { internalAnalyticsWriteKey, subdomain } = internalAnalytics;
      const internal = new InternalAnalytics(subdomain);
      internal.init({ apiKey: internalAnalyticsWriteKey });
      this.analyticsIntegrations.push(internal);
    }

    const amplitudeEnabled = Boolean(analytics?.amplitude?.apiKey);
    const fathomEnabled = Boolean(analytics?.fathom?.siteId);
    const ga4Enabled = Boolean(analytics?.ga4?.measurementId);
    const hotjarEnabled = Boolean(analytics?.hotjar?.hjid && analytics?.hotjar?.hjsv);
    const logrocketEnabled = Boolean(analytics?.logrocket?.appId);
    const mixpanelEnabled = Boolean(analytics?.mixpanel?.projectToken);
    const pirschEnabled = Boolean(analytics?.pirsch?.id);
    const posthogEnabled = Boolean(analytics?.posthog?.apiKey);
    const segmentEnabled = Boolean(analytics?.segment?.writeKey);

    if (!analytics || Object.keys(analytics).length === 0) {
      return;
    }

    if (amplitudeEnabled && analytics.amplitude) {
      const amplitude = new AmplitudeAnalytics();
      amplitude.init(analytics.amplitude);
      this.analyticsIntegrations.push(amplitude);
    }

    if (fathomEnabled && analytics.fathom) {
      const fathom = new FathomAnalytics();
      fathom.init(analytics.fathom);
      this.analyticsIntegrations.push(fathom);
    }

    if (ga4Enabled && analytics.ga4) {
      const ga4 = new GA4Analytics();
      ga4.init(analytics.ga4);
      this.analyticsIntegrations.push(ga4);
    }

    if (hotjarEnabled && analytics.hotjar) {
      const hotjar = new HotjarAnalytics();
      hotjar.init(analytics.hotjar);
      this.analyticsIntegrations.push(hotjar);
    }

    if (logrocketEnabled && analytics.logrocket) {
      const logrocket = new LogrocketAnalytics();
      logrocket.init(analytics.logrocket);
      this.analyticsIntegrations.push(logrocket);
    }

    if (mixpanelEnabled && analytics.mixpanel) {
      const mixpanel = new MixpanelAnalytics();
      mixpanel.init(analytics.mixpanel);
      this.analyticsIntegrations.push(mixpanel);
    }

    if (pirschEnabled && analytics.pirsch) {
      const pirsch = new PirschAnalytics();
      pirsch.init(analytics.pirsch);
      this.analyticsIntegrations.push(pirsch);
    }

    if (posthogEnabled && analytics.posthog) {
      const posthog = new PostHogAnalytics();
      posthog.init(analytics.posthog);
      this.analyticsIntegrations.push(posthog);
    }

    if (segmentEnabled && analytics.segment) {
      const segment = new SegmentAnalytics();
      segment.init(analytics.segment);
      this.analyticsIntegrations.push(segment);
    }
  }

  createEventListener(eventName: string) {
    const listeners = this.analyticsIntegrations.map((integration) =>
      integration.createEventListener(eventName)
    );
    return async function (eventProperties: object) {
      listeners.forEach((track) => track(eventProperties));
    };
  }

  onRouteChange(url: string, routeProps: RouteProps) {
    this.analyticsIntegrations.forEach((integration) => integration.onRouteChange(url, routeProps));
  }
}
