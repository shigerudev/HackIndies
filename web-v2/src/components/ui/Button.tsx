import Link from 'next/link';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'link';
type Size = 'md' | 'lg';

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = CommonProps & ComponentPropsWithoutRef<'button'> & { href?: undefined };

type ButtonAsLink = CommonProps & {
  href: string;
  target?: string;
  rel?: string;
  'aria-label'?: string;
};

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const VARIANT_CLASS: Record<Variant, string> = {
  primary: 'btn btn-primary',
  secondary: 'btn btn-secondary',
  ghost: 'btn btn-ghost',
  link: 'btn-link',
};

export function Button(props: ButtonProps) {
  const { variant = 'primary', size = 'md', className, children, ...rest } = props as CommonProps & {
    [k: string]: unknown;
  };

  const classes = cn(VARIANT_CLASS[variant], size === 'lg' && 'btn-lg', className);

  if ('href' in rest && typeof rest.href === 'string') {
    const { href, target, rel, ...anchorRest } = rest as {
      href: string;
      target?: string;
      rel?: string;
    };
    const isExternal = href.startsWith('http') || target === '_blank';
    if (isExternal) {
      return (
        <a
          href={href}
          target={target}
          rel={rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined)}
          className={classes}
          {...(anchorRest as ComponentPropsWithoutRef<'a'>)}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} {...(anchorRest as Record<string, unknown>)}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as ComponentPropsWithoutRef<'button'>)}>
      {children}
    </button>
  );
}
