import * as Ariakit from '@ariakit/react';
import { AnimatePresence, motion } from 'framer-motion';
import { forwardRef, useMemo } from 'react';

interface TooltipAnchorProps extends Ariakit.TooltipAnchorProps {
  description: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export const TooltipAnchor = forwardRef<HTMLDivElement, TooltipAnchorProps>(function TooltipAnchor(
  { description, side = 'top', ...props },
  ref,
) {
  const tooltip = Ariakit.useTooltipStore({ placement: side });
  const mounted = Ariakit.useStoreState(tooltip, (state) => state.mounted);
  const placement = Ariakit.useStoreState(tooltip, (state) => state.placement);

  const { x, y } = useMemo(() => {
    const dir = placement.split('-')[0];
    switch (dir) {
      case 'top':
        return { x: 0, y: -8 };
      case 'bottom':
        return { x: 0, y: 8 };
      case 'left':
        return { x: -8, y: 0 };
      case 'right':
        return { x: 8, y: 0 };
      default:
        return { x: 0, y: 0 };
    }
  }, [placement]);

  return (
    <Ariakit.TooltipProvider store={tooltip} hideTimeout={0}>
      <Ariakit.TooltipAnchor {...props} ref={ref} />
      <AnimatePresence>
        {mounted && (
          <Ariakit.Tooltip
            gutter={4}
            alwaysVisible
            className="tooltip"
            render={
              <motion.div
                initial={{ opacity: 0, x, y }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, x, y }}
              />
            }
          >
            <Ariakit.TooltipArrow />
            {description}
          </Ariakit.Tooltip>
        )}
      </AnimatePresence>
    </Ariakit.TooltipProvider>
  );
});
