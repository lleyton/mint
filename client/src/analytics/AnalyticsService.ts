export abstract class AnalyticsService implements AnalyticsMediatorInterface {
  abstract init(implementationConfig: ConfigInterface, subdomain?: string): void;
  abstract createEventListener(eventName: string): (eventProperties: object) => Promise<void>;
  abstract onRouteChange(url: string, routeProps: RouteProps): void;
}
