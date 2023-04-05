import { AnalyticsService } from '@/analytics/AnalyticsService';

export default class PirschAnalytics extends AnalyticsService {
  initialized = false;
  // Store events to submit after the library is loaded.
  waitTracking: any[][] = [];
  pirsch = {
    hit: () => {
      return;
    },
    event: (name: string, eventProperties: object) =>
      this.waitTracking.push([name, eventProperties]),
  } as any;

  init(implementationConfig: ConfigInterface) {
    if (!implementationConfig?.id || process.env.NODE_ENV !== 'production') {
      return;
    }
    const pirschId = implementationConfig.id;
    import('pirsch-sdk/web')
      .then((_pirsch) => {
        if (!this.initialized) {
          // Get default module export
          this.pirsch = new _pirsch.Pirsch({
            identificationCode: pirschId,
          });

          this.initialized = true;

          this.waitTracking.forEach((event) => {
            const [eventName, eventProperties] = event;
            this.pirsch.event(eventName, eventProperties);
          });
        }
      })
      .catch((e) => {
        console.error(e);
      });
  }

  createEventListener(eventName: string) {
    const captureFunc = async function capture(this: PirschAnalytics, eventProperties: object) {
      this.pirsch.event(eventName, eventProperties);
    };
    return captureFunc.bind(this);
  }

  onRouteChange(_: string): void {
    this.pirsch.hit();
  }
}
