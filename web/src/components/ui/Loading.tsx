import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullScreen?: boolean;
}

const sizes = {
  sm: 'w-5 h-5',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

export function Loading({ size = 'md', className, fullScreen }: LoadingProps) {
  const spinner = (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-gray-200 border-t-[var(--primary)]',
        sizes[size],
        className
      )}
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}

export function LoadingPage() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[400px]">
      <Loading size="lg" />
    </div>
  );
}
