import React from 'react';
import { Row, Col, Card, ProgressBar } from 'react-bootstrap';
import { Star, Clock, User, BookOpen, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';


interface Review {
  responses: {
    [key: string]: string | number | string[];
  };
}

interface ReviewSummaryProps {
  reviews: Review[];
  onViewFullResults: () => void;
}

const ReviewSummary: React.FC<ReviewSummaryProps> = ({ reviews, onViewFullResults }) => {
  const calculateAverageRating = (key: string): number => {
    const ratings = reviews.map(review => Number(review.responses[key])).filter(rating => !isNaN(rating));
    return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  };

  const calculateProportion = (key: string, value: string): number => {
    const count = reviews.filter(review => {
      const response = review.responses[key];
      return Array.isArray(response) ? response.includes(value) : response === value;
    }).length;
    return (count / reviews.length) * 100;
  };

  const getMostCommonValue = (key: string): string => {
    const valueCounts = reviews.reduce((acc, review) => {
      const value = review.responses[key];
      acc[value as string] = (acc[value as string] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(valueCounts).sort((a, b) => b[1] - a[1])[0][0];
  };

  const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
    <div>
      {[...Array(5)].map((_, i) => (
        <Star key={i} fill={i < Math.round(rating) ? "#ffc107" : "none"} stroke={i < Math.round(rating) ? "#ffc107" : "#e4e5e9"} size={24} />
      ))}
      <span className="ms-2">{rating.toFixed(1)}</span>
    </div>
  );

  return (
    <Card className="mb-4">
      <Card.Body>
        <Row>
          <Col md={4} className="mb-3">
            <h5>Overall Rating</h5>
            <StarRating rating={calculateAverageRating('rating_overall')} />
          </Col>
          <Col md={4} className="mb-3">
            <h5>Tutorial Rating</h5>
            <StarRating rating={calculateAverageRating('rating_tutorial')} />
          </Col>
          <Col md={4} className="mb-3">
            <h5>Feedback Rating</h5>
            <StarRating rating={calculateAverageRating('rating_feedback')} />
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6} className="mb-3">
            <h5>Feedback</h5>
            <div className="d-flex align-items-center mb-2">
              <MessageSquare size={18} className="me-2" />
              <div className="w-100">
                <div className="d-flex justify-content-between">
                  <span>Written - Specific</span>
                  <span>{calculateProportion('feedback_written', '💬 Yes - I got comments on specific sections').toFixed(0)}%</span>
                </div>
                <ProgressBar now={calculateProportion('feedback_written', '💬 Yes - I got comments on specific sections')} />
              </div>
            </div>
            <div className="d-flex align-items-center mb-2">
              <MessageSquare size={18} className="me-2" />
              <div className="w-100">
                <div className="d-flex justify-content-between">
                  <span>Written - Overall</span>
                  <span>{calculateProportion('feedback_written', '📝 Yes - I got an overall comment for the whole submission').toFixed(0)}%</span>
                </div>
                <ProgressBar now={calculateProportion('feedback_written', '📝 Yes - I got an overall comment for the whole submission')} />
              </div>
            </div>
            <div className="d-flex align-items-center">
              <MessageSquare size={18} className="me-2" />
              <div className="w-100">
                <div className="d-flex justify-content-between">
                  <span>Verbal</span>
                  <span>{calculateProportion('feedback_verbal', '🗣️ Yes').toFixed(0)}%</span>
                </div>
                <ProgressBar now={calculateProportion('feedback_verbal', '🗣️ Yes')} />
              </div>
            </div>
          </Col>
          <Col md={6} className="mb-3">
            <h5>Tutorial</h5>
            <div className="d-flex align-items-center mb-2">
              <Clock size={18} className="me-2" />
              <span>Length: {getMostCommonValue('tutorial_length')}</span>
            </div>
            <div className="d-flex align-items-center mb-2">
              <BookOpen size={18} className="me-2" />
              <span>Structure: {getMostCommonValue('tutorial_structure')}</span>
            </div>
            <div className="d-flex align-items-center">
              <User size={18} className="me-2" />
              <span>Explanations: {getMostCommonValue('tutorial_explanations')}</span>
            </div>
          </Col>
        </Row>
        <div className="text-center">
          <button className="btn btn-primary" onClick={onViewFullResults}>View Full Results ({reviews.length} reviews)</button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ReviewSummary;