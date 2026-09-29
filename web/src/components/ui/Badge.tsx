import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

const badgeStyles = cva('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold', {
  variants: {
    tone: {
      neutral: 'bg-stone-100 text-stone-600',
      warning: 'bg-amber-100 text-amber-700',
      success: 'bg-emerald-100 text-emerald-700',
      danger: 'bg-rose-100 text-rose-700',
    },
  },
  defaultVariants: { tone: 'neutral' },
});

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeStyles> {}

export function Badge({ tone, className, ...props }: BadgeProps) {
  return <span className={cn(badgeStyles({ tone }), className)} {...props} />;
}
