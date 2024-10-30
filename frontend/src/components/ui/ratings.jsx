import React, { useState } from 'react';
import { Star } from 'lucide-react';

import { cn } from '@/lib/utils';

const ratingVariants = {
  default: {
    star: 'text-violet-400',
    emptyStar: 'text-muted-foreground',
  },
  destructive: {
    star: 'text-red-500',
    emptyStar: 'text-red-200',
  },
  yellow: {
    star: 'text-yellow-500',
    emptyStar: 'text-yellow-200',
  },
};

const Ratings = ({
  rating,
  totalStars = 5,
  size = 20,
  fill = true,
  Icon = <Star />,
  variant = 'default',
  onChange,
  ...props
}) => {
  const [currentRating, setCurrentRating] = useState(rating);

  const handleClick = (index) => {
    const newRating = index + 1;
    setCurrentRating(newRating);
    if (onChange) {
      onChange(newRating);
    }
  };

  const fullStars = Math.floor(currentRating);
  const partialStar =
    currentRating % 1 > 0 ? (
      <PartialStar
        fillPercentage={currentRating % 1}
        size={size}
        className={cn(ratingVariants[variant].star)}
        Icon={Icon}
      />
    ) : null;

  return (
    <div className={cn('flex items-center gap-2')} {...props}>
      {[...Array(fullStars)].map((_, i) =>
        React.cloneElement(Icon, {
          key: i,
          size,
          className: cn(
            fill ? 'fill-current' : 'fill-transparent',
            ratingVariants[variant].star,
            'cursor-pointer',
          ),
          ...(onChange && { onClick: () => handleClick(i) }),
        }),
      )}
      {partialStar}
      {[...Array(totalStars - fullStars - (partialStar ? 1 : 0))].map((_, i) =>
        React.cloneElement(Icon, {
          key: i + fullStars + 1,
          size,
          className: cn(ratingVariants[variant].emptyStar, 'cursor-pointer'),
          ...(onChange && { onClick: () => handleClick(i + fullStars) }),
        }),
      )}
    </div>
  );
};

// interface PartialStarProps {
//   fillPercentage: number;
//   size: number;
//   className?: string;
//   Icon: React.ReactElement;
// }

const PartialStar = ({ fillPercentage, size, className, Icon }) => {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {React.cloneElement(Icon, {
        size,
        className: cn('fill-transparent', className),
      })}
      <div
        style={{
          position: 'absolute',
          top: 0,
          overflow: 'hidden',
          width: `${fillPercentage * 100}%`,
        }}
      >
        {React.cloneElement(Icon, {
          size,
          className: cn('fill-current', className),
        })}
      </div>
    </div>
  );
};

export { Ratings };
