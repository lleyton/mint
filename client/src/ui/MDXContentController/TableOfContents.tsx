import clsx from 'clsx';
import { useContext, Fragment } from 'react';

import { SidebarContext } from '@/layouts/NavSidebar';
import { zIndex } from '@/layouts/zIndex';
import { TableOfContentsSection } from '@/types/tableOfContentsSection';

export function TableOfContents({ tableOfContents, currentSection }: any) {
  const sidebarContext = useContext(SidebarContext);
  const isMainNav = Boolean(sidebarContext);

  function closeNav() {
    if (isMainNav && sidebarContext) {
      sidebarContext.setNavIsOpen(false);
    }
  }

  function isActive(section: TableOfContentsSection) {
    if (section.slug === currentSection) {
      return true;
    }
    if (!section.children) {
      return false;
    }
    return section.children.findIndex(isActive) > -1;
  }

  const pageHasSubsections = tableOfContents.some(
    (section: TableOfContentsSection) => section.children.length > 0
  );

  if (!Array.isArray(tableOfContents) || tableOfContents.length === 0) {
    return null;
  }

  return (
    <div className={clsx(zIndex.Control, 'hidden xl:flex flex-none pl-10 w-[19rem]')}>
      <ul className="fixed text-slate-700 text-sm leading-6 w-[16.5rem] h-[calc(100%-8rem)] overflow-y-auto">
        {tableOfContents.map((section: TableOfContentsSection) => {
          return (
            <Fragment key={section.slug}>
              <li>
                <a
                  href={`#${section.slug}`}
                  onClick={closeNav}
                  className={clsx(
                    'block py-1',
                    pageHasSubsections ? 'font-medium' : '',
                    isActive(section)
                      ? 'font-medium text-primary dark:text-primary-light'
                      : 'hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300'
                  )}
                >
                  {section.title}
                </a>
              </li>
              {section.children.map((subsection: TableOfContentsSection) => {
                const depthStartingFromH2 = subsection.depth - 2;
                return (
                  <li style={{ marginLeft: depthStartingFromH2 + 'rem' }} key={subsection.slug}>
                    <a
                      href={`#${subsection.slug}`}
                      onClick={closeNav}
                      className={clsx(
                        'group flex items-start py-1 whitespace-pre-wrap',
                        isActive(subsection)
                          ? 'text-primary dark:text-primary-light'
                          : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300'
                      )}
                    >
                      {subsection.title}
                    </a>
                  </li>
                );
              })}
            </Fragment>
          );
        })}
      </ul>
    </div>
  );
}
