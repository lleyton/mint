import clsx from 'clsx';
import { ReactNode } from 'react';

import { zIndex } from './zIndex';

export function ContentSideLayout({
  sticky,
  children,
}: {
  sticky?: boolean;
  children?: ReactNode;
}) {
  // top-0 would stick to the top of the window. We make it larger to go under the nav bar and have a little padding
  return (
    <div
      className={clsx(
        'hidden xl:flex',
        sticky && [`self-start top-20 h-auto sticky`, zIndex.Navbar]
      )}
    >
      {children}
    </div>
  );
}
