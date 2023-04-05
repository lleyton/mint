import { Card as GenericCard, CardProps } from '@mintlify/components';
import clsx from 'clsx';
import Link from 'next/link';
import { forwardRef, ReactNode } from 'react';
import React from 'react';

import { IconType } from '@/types/config';
import { ComponentIcon } from '@/ui/Icon';

export function Card({
  title,
  icon,
  iconType,
  color,
  href,
  children,
}: {
  title?: string;
  icon?: ReactNode | string;
  iconType?: IconType;
  color?: string;
  href?: string;
  children?: React.ReactNode;
}) {
  const Icon =
    typeof icon === 'string' ? (
      <ComponentIcon
        icon={icon}
        iconType={iconType}
        color={color}
        className="h-6 w-6 bg-primary dark:bg-primary-light"
        overrideColor
      />
    ) : (
      icon
    );

  // Using 'a' because href is passed, which makes the card an anchor element.
  const props: CardProps<'a'> = {
    as: 'a',
    className: clsx(
      // We need to set these as important because mint adds an underline to links with a border
      // that overrides our own border color.
      '!border-slate-200 dark:!border-slate-800',
      href && 'hover:!border-primary dark:hover:!border-primary-light'
    ),
    title,
    icon: Icon,
    href,
    children,
  };

  // Resolves `Function components cannot be given refs` warning.
  const RefCard = forwardRef<'a', CardProps<'a'>>((args, ref) => (
    <GenericCard {...args} mRef={ref} />
  ));
  RefCard.displayName = 'RefCard';

  // We don't use DynamicLink because we cannot wrap the Card in an extra <a> tag without
  // messing with the Card's styling. The Card already sets an <a> tag when href is passed to it.
  if (href && (href.startsWith('/') || href.startsWith('#'))) {
    return (
      <Link href={href} passHref legacyBehavior>
        <RefCard {...props} />
      </Link>
    );
  }

  return <GenericCard {...props} />;
}
