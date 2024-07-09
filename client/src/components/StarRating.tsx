// https://dev.to/kartikbudhraja/creating-a-dynamic-star-rating-system-in-react-2c8
import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  totalStars?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  totalStars = 5,
  size = 24,
  interactive = false,
  onChange
}) => {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center' }}>
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1;
        return (
          <Star
            key={index}
            size={size}
            fill={starValue <= rating ? "#ffc107" : "none"}
            stroke={starValue <= rating ? "#ffc107" : "#e4e5e9"}
            style={{ cursor: interactive ? 'pointer' : 'default' }}
            onClick={() => interactive && onChange && onChange(starValue)}
          />
        );
      })}
      {!interactive && <span className="ms-2">{rating.toFixed(1)}</span>}
    </div>
  );
};

export default StarRating;