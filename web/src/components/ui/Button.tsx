import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

    const variants = {
      primary:
        'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] focus:ring-[var(--primary)] shadow-md shadow-[var(--primary)]/25 hover:shadow-lg hover:shadow-[var(--primary)]/30',
      secondary:
        'bg-[var(--muted)] text-[var(--foreground)] hover:bg-slate-200 focus:ring-slate-400',
      outline:
        'border-2 border-[var(--border)] bg-transparent hover:bg-[var(--muted)] hover:border-[var(--primary)] focus:ring-[var(--primary)]',
      ghost:
        'bg-transparent hover:bg-[var(--muted)] focus:ring-[var(--primary)]',
      destructive:
        'bg-[var(--destructive)] text-white hover:bg-red-600 focus:ring-[var(--destructive)] shadow-md shadow-red-500/25',
      gradient:
        'gradient-bg text-white hover:opacity-90 focus:ring-[var(--primary)] shadow-md shadow-purple-500/25 hover:shadow-lg',
    };

    const sizes = {
      sm: 'h-9 px-4 text-sm',
      md: 'h-11 px-5 text-base',
      lg: 'h-13 px-7 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
