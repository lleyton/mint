import { Gradient } from './gradient';

export type NavigationEntry = string | Navigation;

export type Navigation = {
  group: string;
  pages: NavigationEntry[];
  version?: string;
};

export function isNavigation(navigation: Navigation | NavigationEntry): navigation is Navigation {
  return Boolean(
    navigation && navigation.hasOwnProperty('group') && navigation.hasOwnProperty('pages')
  );
}

type Logo = string | { light: string; dark: string; href?: string };

type NavbarLink = {
  url: string;
  type?: 'github' | 'link' | string;
  name?: string;
};

export type TopbarCta = NavbarLink;

export const iconTypes = [
  'brands',
  'duotone',
  'light',
  'regular',
  'sharp-solid',
  'solid',
  'thin',
] as const;

export type IconType = (typeof iconTypes)[number];

export type Anchor = {
  name: string;
  url: string;
  icon?: string;
  iconType?: IconType;
  color?: string | Gradient;
  isDefaultHidden?: boolean;
  version?: string;
};

// To deprecate array types
type FooterSocial = {
  type: string;
  url: string;
};

type Integrations = {
  intercom?: string;
};

type FooterSocials = Record<string, string>;

export type ApiConfig = {
  baseUrl?: string | string[];
  auth?: {
    method: string; // 'key', 'bearer', or 'basic'
    name?: string;
    inputPrefix?: string;
  };
  hidePlayground?: boolean;
};

export type Config = {
  mintlify?: string;
  name: string;
  logo?: Logo;
  favicon?: string;
  openApi?: string;
  api?: ApiConfig;
  modeToggle?: {
    default?: string; // 'light' or 'dark'
    isHidden?: boolean;
  };
  versions?: string[];
  metadata?: Record<string, string>;
  colors?: {
    primary: string;
    light?: string;
    dark?: string;
    background?: {
      light?: string;
      dark?: string;
    };
    anchors?: string | Gradient;
  };
  topbarCtaButton?: NavbarLink;
  topbarLinks?: NavbarLink[];
  navigation?: Navigation[];
  topAnchor?: {
    name: string;
    icon?: string;
    iconType?: IconType;
    color?: string;
  };
  repo?: {
    github?: {
      owner: string;
      repo: string;
      deployBranch: string;
      contentDirectory: string;
      isPrivate?: boolean;
    };
  };
  anchors?: Anchor[];
  footerSocials?: FooterSocial[] | FooterSocials;
  backgroundImage?: string;
  hideFeedbackButtons?: boolean;
  analytics?: AnalyticsMediatorConstructorInterface;
  integrations?: Integrations;
  __injected?: {
    analytics?: AnalyticsMediatorConstructorInterface;
  };
};

export const findFirstNavigationEntry = (
  group: Navigation,
  target: string
): NavigationEntry | undefined => {
  return group.pages.find((page) => {
    if (typeof page === 'string') {
      return page.startsWith(target);
    } else {
      return findFirstNavigationEntry(page, target);
    }
  });
};
