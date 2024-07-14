// https://dev.to/kartikbudhraja/creating-a-dynamic-star-rating-system-in-react-2c8
import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
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
  const [internalRating, setInternalRating] = useState(rating);
  const [hover, setHover] = useState(0);

  useEffect(() => {
    setInternalRating(rating);
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

  const roundedRating = Math.round(rating);

  return (
    <div 
      style={{ display: 'inline-flex', alignItems: 'center' }}
      onMouseLeave={handleMouseLeave}
    >
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1;
        return (
          <Star
            key={index}
            size={size}
            fill={starValue <= (interactive ? (hover || internalRating) : roundedRating) ? "#ffc107" : "none"}
            stroke={starValue <= (interactive ? (hover || internalRating) : roundedRating) ? "#ffc107" : "#e4e5e9"}
            style={{ cursor: interactive ? 'pointer' : 'default' }}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
          />
        );
      })}
      {!interactive && <span className="ms-2">{rating.toFixed(decimal)}</span>}
    </div>
  );
};

export default StarRating;