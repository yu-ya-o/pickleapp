import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
}

export function Card({ className, children, hover = true, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-[var(--border)] shadow-sm',
        'transition-all duration-200',
        hover && 'hover:shadow-lg hover:border-[var(--primary)]/20',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: Omit<CardProps, 'hover'>) {
  return (
    <div
      className={cn('px-5 py-4 border-b border-[var(--border)]', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardContent({ className, children, ...props }: Omit<CardProps, 'hover'>) {
  return (
    <div className={cn('p-5', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: Omit<CardProps, 'hover'>) {
  return (
    <div
      className={cn('px-5 py-4 border-t border-[var(--border)] bg-[var(--muted)]/50 rounded-b-2xl', className)}
      {...props}
    >
      {children}
    </div>
  );
}
