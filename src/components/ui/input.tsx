import * as React from 'react';

import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      'flex h-11 w-full rounded-md border border-input bg-white px-3.5 py-2 text-[0.9375rem] text-charcoal-900 shadow-subtle transition-colors',
      'placeholder:text-charcoal-400 file:border-0 file:bg-transparent file:text-sm file:font-medium',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:border-cymru-400',
      'disabled:cursor-not-allowed disabled:bg-charcoal-50 disabled:opacity-70',
      'aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/30',
      className,
    )}
    {...props}
  />
));
Input.displayName = 'Input';

export { Input };
