import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Spinner } from 'react-bootstrap';

interface Review {
  _id: string;
  responses: { [key: string]: string };
  submittedAt: string;
  college: string;
}

const baseURL = process.env.REACT_APP_API_URL;

const UserReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get<Review[]>(`${baseURL}/user/reviews`, { withCredentials: true });
        setReviews(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setError('Failed to fetch reviews. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, []);

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
    return <div className="alert alert-danger">{error}</div>;
  }

  if (reviews.length === 0) {
    return <p>You haven't submitted any reviews yet.</p>;
  }

  return (
    <div>
      <h2 className="mb-4">Your reviews</h2>
      {reviews.map((review) => (
        <Card key={review._id} className="mb-4">
          <Card.Body>
            <Card.Title>{`${review.responses.paperName} (${review.responses.paperCode}) - ${review.responses.tutor}`}</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">
            Submitted: {new Date(review.submittedAt).toLocaleDateString("en-GB", { year: 'numeric', month: 'long', day: 'numeric' })}
            </Card.Subtitle>
            {Object.entries(review.responses).map(([key, value]) => {
              if (!['tutor', 'subject', 'paperCode', 'paper', 'paperName', 'submittedAt'].includes(key) && value.trim() !== "") {
                return (
                  <Card.Text key={key}>
                    <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}
                  </Card.Text>
                );
              }
              return null;
            })}
          </Card.Body>
        </Card>
      ))}
    </div>
  );
};

export default UserReviews;