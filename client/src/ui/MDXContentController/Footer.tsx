import clsx from 'clsx';
import Link from 'next/link';
import React, { useContext } from 'react';

import { ConfigContext } from '@/context/ConfigContext';
import { useMDXContent } from '@/hooks/useMDXContent';
import { getSidebarTitle } from '@/utils/getAllMetaTags';

import Icon from '../Icon';

type SocialProps = {
  type?: string;
  url: string;
};

const Social = ({ type, url }: SocialProps) => {
  const icon = type === 'website' || type == null ? 'earth-americas' : type;
  if (
    icon !== 'earth-americas' &&
    icon !== 'discord' &&
    icon !== 'facebook' &&
    icon !== 'slack' &&
    icon !== 'twitter' &&
    icon !== 'github' &&
    icon !== 'linkedin' &&
    icon !== 'instagram' &&
    icon !== 'youtube' &&
    icon !== 'medium' &&
    icon !== 'hacker-news' &&
    icon !== 'telegram'
  ) {
    return null;
  }

  return (
    <a href={url}>
      <span className="sr-only">{type}</span>
      <Icon
        icon={icon}
        iconType="solid"
        className="h-5 w-5 bg-slate-400 dark:bg-slate-500 hover:bg-slate-500 dark:hover:bg-slate-400"
      />
    </a>
  );
};

export function Footer() {
  const { mintConfig } = useContext(ConfigContext);
  const [{ next: n, prev, pageMetadata }] = useMDXContent();

  const previous = pageMetadata.hideFooterPagination ? null : prev;
  const next = pageMetadata.hideFooterPagination ? null : n;
  return (
    <footer className={clsx('text-sm leading-6', previous || next ? 'mt-12' : 'mt-16')}>
      {(previous || next) && (
        <div className="mb-10 text-slate-700 font-semibold flex items-center dark:text-slate-200">
          {previous && (
            <Link
              href={previous?.href as never}
              className="group flex items-center hover:text-slate-900 dark:hover:text-white"
            >
              <svg
                viewBox="0 0 3 6"
                className="mr-3 w-auto h-1.5 text-slate-400 overflow-visible group-hover:text-slate-600 dark:group-hover:text-slate-300"
              >
                <path
                  d="M3 0L0 3L3 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {getSidebarTitle(previous)}
            </Link>
          )}
          {next && (
            <Link
              href={next?.href as never}
              className="group ml-auto flex items-center hover:text-slate-900 dark:hover:text-white"
            >
              {getSidebarTitle(next)}
              <svg
                viewBox="0 0 3 6"
                className="ml-3 w-auto h-1.5 text-slate-400 overflow-visible group-hover:text-slate-600 dark:group-hover:text-slate-300"
              >
                <path
                  d="M0 0L3 3L0 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          )}
        </div>
      )}
      <div className="pt-10 border-t border-slate-200 sm:flex justify-between dark:border-slate-800 pb-28">
        <div className="mb-6 sm:mb-0 sm:flex">
          <a
            href="https://mintlify.com"
            target="_blank"
            rel="noreferrer"
            className="text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300"
          >
            Powered by Mintlify
          </a>
        </div>
        <div className="flex space-x-6">
          {mintConfig?.footerSocials &&
            Array.isArray(mintConfig.footerSocials) &&
            mintConfig.footerSocials.map((social) => (
              <Social key={social.url} url={social.url} type={social?.type} />
            ))}
          {mintConfig?.footerSocials &&
            typeof mintConfig.footerSocials === 'object' &&
            Object.entries(mintConfig.footerSocials).map(([socialType, socialUrl]) => (
              <Social key={socialUrl} url={socialUrl} type={socialType} />
            ))}
        </div>
      </div>
    </footer>
  );
}
