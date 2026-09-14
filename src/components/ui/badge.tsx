import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-charcoal-900 text-white',
        secondary: 'border-transparent bg-charcoal-100 text-charcoal-700',
        outline: 'border-border bg-white text-charcoal-600',
        success: 'border-transparent bg-moss-100 text-moss-800',
        warning: 'border-transparent bg-amber-100 text-amber-900',
        danger: 'border-transparent bg-red-100 text-red-900',
        info: 'border-transparent bg-blue-100 text-blue-900',
        cymru: 'border-transparent bg-cymru-50 text-cymru-700',
        demo: 'border-dashed border-charcoal-300 bg-charcoal-50 text-charcoal-600',
      },
      size: {
        default: 'text-xs',
        sm: 'px-2 py-0 text-[0.6875rem]',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { Badge, badgeVariants };
