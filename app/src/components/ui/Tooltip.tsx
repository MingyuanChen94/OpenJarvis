import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export const TooltipProvider = TooltipPrimitive.Provider;

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

export function Tooltip({
  children,
  content,
  side = 'top',
  className,
  ...props
}: TooltipProps & Omit<ComponentProps<typeof TooltipPrimitive.Root>, 'children'>) {
  if (!content) return <>{children}</>;
  return (
    <TooltipPrimitive.Root delayDuration={250} {...props}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={6}
          className={cn(
            'z-[60] select-none rounded-md border border-border bg-surface px-2 py-1 text-xs text-text shadow-md',
            className,
          )}
        >
          {content}
          <TooltipPrimitive.Arrow className="fill-surface" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
