import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PageLayout from './PageLayout';
import { useNotification } from '../context/NotificationContext';
import { useLoading } from '../context/LoadingContext';
import ReviewCard from './ReviewCard';
import { Review } from '../types';

const UserReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [hasFetched, setHasFetched] = useState(false);
  const { showNotification } = useNotification();
  const { startLoading, stopLoading } = useLoading();

  useEffect(() => {
    const fetchReviews = async () => {
      startLoading();
      try {
        const response = await axios.get<Review[]>('/user/reviews', { withCredentials: true });
        setReviews(response.data);
        setHasFetched(true);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        showNotification('Failed to fetch reviews. Please try again.', 'error');
      } finally {
        stopLoading();
      }
    };

    fetchReviews();
  }, [showNotification, startLoading, stopLoading]);

  const renderContent = () => {
    if (!hasFetched) {
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