import clsx from 'clsx';
import { ReactNode } from 'react';

import { useMDXContent } from '@/hooks/useMDXContent';

import { SidePanel } from './SidePanel';

export const Container = ({ children }: { children: ReactNode }) => {
  const [{ contentWidth }] = useMDXContent();
  return (
    <div className="flex flex-row pt-9 gap-12 items-stretch">
      <div
        className={clsx(
          'relative grow mx-auto xl:-ml-12 overflow-auto xl:pr-1 xl:pl-12',
          contentWidth
        )}
      >
        {children}
      </div>
      <SidePanel />
    </div>
  );
};
