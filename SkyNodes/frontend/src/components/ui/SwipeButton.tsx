import { forwardRef } from 'react';
import type React from 'react';
import { cn } from '@/lib/utils';

interface SwipeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  firstText: string;
  secondText: string;
  className?: string;
  firstClass?: string;
  secondClass?: string;
}

const SwipeButton = forwardRef<HTMLButtonElement, SwipeButtonProps>(
  (
    {
      className = '',
      secondText = 'Get access',
      firstText = 'Get access',
      firstClass = 'bg-orange-500 text-white',
      secondClass = 'bg-black text-white',
      ...props
    },
    ref,
  ) => {
    const common = 'flex items-center justify-center px-4 py-2 text-2xl font-bold duration-300 ease-in-out';
    return (
      <button
        ref={ref}
        {...props}
        className={cn('group/button relative min-w-fit overflow-hidden rounded-md', className)}
      >
        <span
          className={cn(
            'absolute inset-0 translate-y-full group-hover/button:translate-y-0',
            common,
            secondClass,
          )}
        >
          {secondText}
        </span>
        <span className={cn('group-hover/button:-translate-y-full', common, firstClass)}>
          {firstText}
        </span>
      </button>
    );
  },
);

SwipeButton.displayName = 'SwipeButton';
export default SwipeButton;
