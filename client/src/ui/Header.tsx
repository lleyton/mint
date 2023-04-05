import { Dialog } from '@headlessui/react';
import axios from 'axios';
import clsx from 'clsx';
import gh from 'github-url-to-object';
import isAbsoluteUrl from 'is-absolute-url';
import Link from 'next/link';
import Router from 'next/router';
import { useContext } from 'react';
import { useEffect, useState } from 'react';

import { ConfigContext } from '@/context/ConfigContext';
import { Event } from '@/enums/events';
import { useAnalyticsContext } from '@/hooks/useAnalyticsContext';
import { zIndex } from '@/layouts/zIndex';
import { TopbarCta } from '@/types/config';
import { Logo } from '@/ui/Logo';
import { SearchButton } from '@/ui/search/Search';
import getLogoHref from '@/utils/getLogoHref';

import Icon from './Icon';
import { ThemeToggle } from './ThemeToggle';
import { VersionSelect } from './VersionSelect';

export function NavPopover({
  display = 'md:hidden',
  className,
  ...props
}: {
  display: string;
  className: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    function handleRouteChange() {
      setIsOpen(false);
    }
    Router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      Router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [isOpen]);

  return (
    <div className={clsx(className, display)} {...props}>
      <button
        type="button"
        className="text-slate-500 w-8 h-8 flex items-center justify-center hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300"
        onClick={() => setIsOpen(true)}
      >
        <span className="sr-only">Navigation</span>
        <svg width="24" height="24" fill="none" aria-hidden="true">
          <path
            d="M12 6v.01M12 12v.01M12 18v.01M12 7a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm0 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm0 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <Dialog
        as="div"
        className={clsx(zIndex.Navbar, 'fixed inset-0', display)}
        open={isOpen}
        onClose={setIsOpen}
      >
        <Dialog.Overlay className="fixed inset-0 bg-background-dark backdrop-blur-sm opacity-20 dark:opacity-80" />
        <div className="fixed top-4 right-4 w-full max-w-xs bg-white rounded-lg shadow-lg p-6 text-base font-semibold text-slate-900 dark:bg-background-dark dark:text-slate-400 ring-slate-600/50 dark:ring-2">
          <button
            type="button"
            className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300"
            onClick={() => setIsOpen(false)}
          >
            <span className="sr-only">Close navigation</span>
            <svg viewBox="0 0 10 10" className="w-2.5 h-2.5 overflow-visible" aria-hidden="true">
              <path
                d="M0 0L10 10M10 0L0 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <ul className="space-y-6">
            <NavItems />
          </ul>
          <div className="mt-8 flex flex-row gap-4">
            <p className="font-normal inline">Website theme</p>
            <div className="inline relative">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

function GitHubCta({ button }: { button: TopbarCta }) {
  const trackCtaClick = useAnalyticsContext(Event.CTAClick);
  const [repoData, setRepoData] = useState<{ stargazers_count: number; forks_count: number }>();

  const github = gh(button.url);

  useEffect(() => {
    if (github == null) {
      return;
    }

    axios.get(`https://api.github.com/repos/${github.user}/${github.repo}`).then(({ data }) => {
      setRepoData(data);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [github?.user, github?.repo]);

  if (github == null) {
    return null;
  }

  return (
    <li className="cursor-pointer">
      <a
        href={button.url}
        target="_blank"
        rel="noreferrer"
        onClick={() => trackCtaClick({ url: button.url, type: 'github' })}
      >
        <div className="group flex items-center space-x-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1024"
            height="1024"
            viewBox="0 0 1024 1024"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z"
              transform="scale(64)"
            />
          </svg>
          <div className="font-normal">
            <div className="text-sm font-medium text-slate-700 group-hover:text-slate-900 dark:text-slate-300 dark:group-hover:text-slate-200">
              {github.user}/{github.repo}
            </div>
            {repoData ? (
              <div className="text-xs flex items-center space-x-2 text-slate-600 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300">
                <span className="flex items-center space-x-1">
                  <Icon
                    className="h-3 w-3 bg-slate-600 dark:bg-slate-400 group-hover:bg-slate-700 dark:group-hover:bg-slate-300"
                    icon="star"
                    iconType="regular"
                  />
                  <span>{repoData.stargazers_count}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Icon
                    className="h-3 w-3 bg-slate-600 dark:bg-slate-400 group-hover:bg-slate-700 dark:group-hover:bg-slate-300"
                    icon="code-fork"
                    iconType="regular"
                  />
                  <span>{repoData.forks_count}</span>
                </span>
              </div>
            ) : (
              <div className="h-4" />
            )}
          </div>
        </div>
      </a>
    </li>
  );
}

function TopBarCtaButton({ button }: { button: TopbarCta }) {
  const trackCtaClick = useAnalyticsContext(Event.CTAClick);

  if (button.type === 'github') {
    return <GitHubCta button={button} />;
  }

  if (button.url && button.name) {
    return (
      <li>
        <Link
          href={button.url ?? '/'}
          target="_blank"
          className="group px-4 py-1.5 relative inline-flex items-center rounded-full shadow-sm text-sm font-medium"
          onClick={() => trackCtaClick({ name: button.name, url: button.url, type: 'button' })}
        >
          <span className="absolute inset-0 bg-primary-dark rounded-full group-hover:opacity-[0.9]" />
          <span className={clsx(zIndex.Control, 'mr-2 text-white')}>{button.name}</span>
          <svg
            width="6"
            height="3"
            className="h-2 overflow-visible -rotate-90 text-white"
            aria-hidden="true"
          >
            <path
              d="M0 0L3 3L6 0"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </Link>
      </li>
    );
  }

  return null;
}

export function NavItems() {
  const { mintConfig } = useContext(ConfigContext);
  const trackNavigationClick = useAnalyticsContext(Event.HeaderNavItemClick);

  const onClickNavigation = (name: string | undefined, url: string) => {
    trackNavigationClick({ name, url });
  };

  return (
    <>
      {mintConfig?.topbarLinks?.map((topbarLink) => {
        const isAbsolute = isAbsoluteUrl(topbarLink.url);

        if (isAbsolute) {
          return (
            <li key={topbarLink.name}>
              <a
                href={topbarLink.url}
                className="font-medium hover:text-primary dark:hover:text-primary-light"
                onClick={() => onClickNavigation(topbarLink.name, topbarLink.url)}
              >
                {topbarLink.name}
              </a>
            </li>
          );
        } else {
          return (
            <li key={topbarLink.name}>
              <Link
                href={topbarLink.url ?? '/'}
                className="font-medium hover:text-primary dark:hover:text-primary-light"
                onClick={() => onClickNavigation(topbarLink.name, topbarLink.url)}
              >
                {topbarLink.name}
              </Link>
            </li>
          );
        }
      })}
      {mintConfig?.topbarCtaButton && <TopBarCtaButton button={mintConfig.topbarCtaButton} />}
    </>
  );
}

export function Header({
  hasNav = false,
  navIsOpen,
  onNavToggle,
  title,
  section,
}: {
  hasNav: boolean;
  navIsOpen: boolean;
  onNavToggle: (toggle: boolean) => void;
  title?: string;
  section?: string;
}) {
  const { mintConfig } = useContext(ConfigContext);
  const [isOpaque, setIsOpaque] = useState(false);

  useEffect(() => {
    const offset = 50;
    function onScroll() {
      if (!isOpaque && window.scrollY > offset) {
        setIsOpaque(true);
      } else if (isOpaque && window.scrollY <= offset) {
        setIsOpaque(false);
      }
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [isOpaque]);

  return (
    <>
      <div
        className={clsx(
          zIndex.Navbar,
          'sticky top-0 w-full backdrop-blur flex-none lg:border-b lg:border-slate-900/5 dark:border-slate-50/[0.06]'
        )}
      >
        <div
          className={clsx(
            'absolute top-0 right-0 left-0 bottom-0 bg-background-light dark:bg-background-dark',
            isOpaque ? '' : 'bg-transparent dark:bg-transparent'
          )}
          style={{ opacity: '80%' }}
        />
        <div className="relative max-w-8xl mx-auto">
          <div
            className={clsx(
              'py-4 border-b border-slate-900/10 lg:px-12 lg:border-0 dark:border-slate-300/10',
              hasNav ? 'mx-4 lg:mx-0' : 'px-4'
            )}
          >
            <div className="relative flex items-center">
              <div className="flex-1 flex items-center space-x-3">
                <Link
                  href={mintConfig ? getLogoHref(mintConfig) : '/'}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    Router.push(mintConfig ? getLogoHref(mintConfig) : '/');
                  }}
                >
                  <span className="sr-only">{mintConfig?.name} home page</span>
                  <Logo />
                </Link>
                <VersionSelect />
              </div>
              <div className="relative flex-none bg-white lg:w-64 xl:w-80 dark:bg-slate-900 pointer-events-auto rounded-md">
                <SearchButton className="hidden w-full lg:flex items-center text-sm leading-6 rounded-md py-1.5 pl-2 pr-3 zinc-box bg-white ring-1 ring-zinc-400/20 hover:ring-zinc-600/25 dark:ring-zinc-600/30 dark:hover:ring-zinc-500/30">
                  {({ actionKey }) => (
                    <>
                      <Icon
                        icon="magnifying-glass"
                        iconType="solid"
                        className="h-4 w-4 ml-1 mr-3 flex-none bg-zinc-500 hover:bg-slate-600 dark:bg-white/50 dark:hover:bg-white/70"
                      />
                      Search...
                      {actionKey && (
                        <span className="ml-auto flex-none text-xs font-semibold">
                          {actionKey[0]}K
                        </span>
                      )}
                    </>
                  )}
                </SearchButton>
              </div>
              <div className="flex-1 relative hidden lg:flex items-center ml-auto justify-end">
                <nav className="text-sm leading-6 font-semibold text-slate-700 dark:text-slate-200">
                  <ul className="flex space-x-8 items-center">
                    <NavItems />
                  </ul>
                </nav>
                {!mintConfig?.modeToggle?.isHidden && (
                  <div className="flex border-l border-slate-100 ml-6 pl-6 dark:border-background-dark dark:brightness-200 h-6"></div>
                )}
                <div className="flex items-center">
                  <ThemeToggle />
                </div>
              </div>
              <SearchButton className="ml-auto text-slate-500 w-8 h-8 -my-1 flex items-center justify-center hover:text-slate-600 lg:hidden dark:text-slate-400 dark:hover:text-slate-300">
                <span className="sr-only">Search</span>
                <Icon
                  icon="magnifying-glass"
                  iconType="solid"
                  className="h-4 w-4 bg-slate-500 dark:bg-slate-400 hover:bg-slate-600 dark:hover:bg-slate-300"
                />
              </SearchButton>
              <NavPopover className="ml-2 -my-1" display="lg:hidden" />
            </div>
          </div>
          {hasNav && (
            <div className="flex items-center p-4 border-b border-slate-900/10 lg:hidden dark:border-slate-50/[0.06]">
              <button
                type="button"
                onClick={() => onNavToggle(!navIsOpen)}
                className="text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300"
              >
                <span className="sr-only">Navigation</span>
                <svg width="24" height="24">
                  <path
                    d="M5 6h14M5 12h14M5 18h14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              {title && (
                <ol className="ml-4 flex text-sm leading-6 whitespace-nowrap min-w-0">
                  {section && (
                    <li className="flex items-center">
                      {section}
                      <svg
                        width="3"
                        height="6"
                        aria-hidden="true"
                        className="mx-3 overflow-visible text-slate-400"
                      >
                        <path
                          d="M0 0L3 3L0 6"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </li>
                  )}
                  <li className="font-semibold text-slate-900 truncate dark:text-slate-200">
                    {title}
                  </li>
                </ol>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
