import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Spinner } from 'react-bootstrap';
import PageLayout from './PageLayout';
import { useNotification } from '../context/NotificationContext';
import ReviewCard from './ReviewCard';
import { Review } from '../types';

const UserReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get<Review[]>('/user/reviews', { withCredentials: true });
        setReviews(response.data);
        setIsLoading(false);
        setError(false);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        showNotification('Failed to fetch reviews. Please try again.', 'error');
        setError(true);
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [showNotification]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      );
    }

    if (error) {
      return null;
    }

    if (reviews.length === 0) {
      return <p>You haven't submitted any reviews yet.</p>;
    }

    return (
      <>
        {reviews.map((review) => (
          <ReviewCard key={review._id} review={review} />
        ))}
      </>
    );
  };

  return (
    <PageLayout title="Your reviews">
      {renderContent()}
    </PageLayout>
  );
};

export default UserReviews;