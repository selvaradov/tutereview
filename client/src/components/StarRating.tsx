// https://dev.to/kartikbudhraja/creating-a-dynamic-star-rating-system-in-react-2c8
import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating?: number;
  totalStars?: number;
  size?: number;
  interactive?: boolean;
  decimal?: number;
  onChange?: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  totalStars = 5,
  size = 24,
  interactive = false,
  decimal = 1,
  onChange
}) => {
  const [internalRating, setInternalRating] = useState(rating ?? 0);
  const [hover, setHover] = useState(0);

  useEffect(() => {
    setInternalRating(rating ?? 0);
  }, [rating]);

  const handleClick = (value: number) => {
    if (interactive) {
      setInternalRating(value);
      if (onChange) {
        onChange(value);
      }
    }
  };

  const handleMouseEnter = (value: number) => {
    if (interactive) {
      setHover(value);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHover(0);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!interactive) return;

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        event.preventDefault();
        setInternalRating((prev) => Math.max(1, prev - 1));
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        event.preventDefault();
        setInternalRating((prev) => Math.min(totalStars, prev + 1));
        break;
      case ' ':
      case 'Enter':
        event.preventDefault();
        if (onChange) {
          onChange(internalRating);
        }
        break;
    }
  };

  const roundedRating = Math.round(internalRating);

  return (
    <div
      style={{ display: 'inline-flex', alignItems: 'center' }}
      onMouseLeave={handleMouseLeave}
      role={interactive ? 'radiogroup' : 'img'}
      aria-label={`${internalRating.toFixed(decimal)} out of ${totalStars} stars`}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={handleKeyDown}
    >
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1;
        const isSelected = starValue <= (interactive ? (hover || internalRating) : roundedRating);
        return (
          <span
            key={index}
            role={interactive ? 'radio' : undefined}
            aria-checked={interactive ? starValue === roundedRating : undefined}
            tabIndex={-1}
            aria-label={interactive ? `${starValue} star${starValue !== 1 ? 's' : ''}` : undefined}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            style={{ cursor: interactive ? 'pointer' : 'default' }}
          >
            <Star
              size={size}
              fill={isSelected ? "#ffc107" : "none"}
              stroke={isSelected ? "#ffc107" : "#e4e5e9"}
              aria-hidden="true"
            />
          </span>
        );
      })}
      {!interactive && (
        <span className="ms-2" aria-hidden="true">
          {internalRating.toFixed(decimal)}
        </span>
      )}
    </div>
  );
};

export default StarRating;