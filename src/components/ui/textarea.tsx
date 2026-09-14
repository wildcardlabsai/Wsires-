import * as React from 'react';

import { cn } from '@/lib/utils';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'flex min-h-[110px] w-full rounded-md border border-input bg-white px-3.5 py-3 text-[0.9375rem] leading-relaxed text-charcoal-900 shadow-subtle transition-colors',
      'placeholder:text-charcoal-400',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:border-cymru-400',
      'disabled:cursor-not-allowed disabled:bg-charcoal-50 disabled:opacity-70',
      'aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/30',
      className,
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

export { Textarea };
