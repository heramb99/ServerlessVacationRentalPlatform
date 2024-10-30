import * as React from 'react';
import { cn } from '@/lib/utils';

const spinnerVariants =
  'w-16 h-16 border-4 border-t-4 border-gray-200 border-t-gray-600 rounded-full animate-spin';

const Loading = React.forwardRef((props, ref) => {
  const { className, placeHolder = 'Loading...', ...rest } = props;
  return (
    <div className="flex flex-col items-center justify-center space-y-4 h-full w-full p-5">
      <div ref={ref} className={cn(spinnerVariants, className)} {...rest} />
      <div>{placeHolder}</div>
    </div>
  );
});

Loading.displayName = 'Loading';

export { Loading };
