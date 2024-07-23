import React from 'react';
import { Row, Col, Card, ProgressBar, Badge } from 'react-bootstrap';
import { LuClock, LuUser, LuBookOpen, LuMessageSquare, LuChevronDown, LuChevronUp, LuChevronLeft } from 'react-icons/lu';
import { Review } from '../types';
import StarRating from './StarRating';

interface ReviewSummaryProps {
  reviews: Review[];
  onToggleFullResults: () => void;
  showFullResults: boolean;
  colleges?: string[];
  collegeLookup: Map<string, string>;
}

const ReviewSummary: React.FC<ReviewSummaryProps> = ({ reviews, onToggleFullResults, showFullResults, colleges, collegeLookup }) => {
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

  return (
    <Card className="mb-4">
      <Card.Body>
      {colleges && colleges.length > 0 && (
          <Row className="mb-3">
            <Col>
              <h5>Colleges with 3 or more reviews submitted</h5>
              <div>
                {colleges.map((college, index) => (
                  <Badge 
                    key={index} 
                    bg="secondary" 
                    className="me-2 mb-2"
                    style={{ padding: '0.5em 0.7em' }}
                  >
                    {collegeLookup.get(college) || college}
                  </Badge>
                ))}
              </div>
            </Col>
          </Row>
        )}
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
            <h5>Tutorial</h5>
            <div className="d-flex align-items-center mb-2">
              <LuClock size={18} className="me-2" />
              <span><strong>Length:</strong> {getMostCommonValue('tutorial_length')}</span>
            </div>
            <div className="d-flex align-items-center mb-2">
              <LuBookOpen size={18} className="me-2" />
              <span><strong>Structure:</strong> {getMostCommonValue('tutorial_structure')}</span>
            </div>
            <div className="d-flex align-items-center mb-2">
              <LuUser size={18} className="me-2" />
              <span><strong>Explanations:</strong> {getMostCommonValue('tutorial_explanations')}</span>
            </div>
            <div className="d-flex align-items-center">
              <LuChevronLeft size={18} className="me-2" />
              <span><strong>Looked at Work Pre-Tutorial:</strong> {getMostCommonValue('pre_tutorial')}</span>
            </div>
          </Col>
          <Col md={6} className="mb-3">
            <h5>Feedback</h5>
            <div className="d-flex align-items-center mb-2">
              <LuMessageSquare size={18} className="me-2" />
              <div className="w-100">
                <div className="d-flex justify-content-between">
                  <span>Specific Comments</span>
                  <span>{calculateProportion('feedback_written', '💬 Yes - I got comments on specific sections').toFixed(0)}%</span>
                </div>
                <ProgressBar now={calculateProportion('feedback_written', '💬 Yes - I got comments on specific sections')} />
              </div>
            </div>
            <div className="d-flex align-items-center mb-2">
              <LuMessageSquare size={18} className="me-2" />
              <div className="w-100">
                <div className="d-flex justify-content-between">
                  <span>Overall Comment</span>
                  <span>{calculateProportion('feedback_written', '📝 Yes - I got an overall comment for the whole submission').toFixed(0)}%</span>
                </div>
                <ProgressBar now={calculateProportion('feedback_written', '📝 Yes - I got an overall comment for the whole submission')} />
              </div>
            </div>
            <div className="d-flex align-items-center">
              <LuMessageSquare size={18} className="me-2" />
              <div className="w-100">
                <div className="d-flex justify-content-between">
                  <span>Numerical mark or grade</span>
                  <span>{calculateProportion('feedback_written', '🔢 Yes - I got a grade / numerical mark').toFixed(0)}%</span>
                </div>
                <ProgressBar now={calculateProportion('feedback_written', '🔢 Yes - I got a grade / numerical mark')} />
              </div>
            </div>
          </Col>
        </Row>
        <div className="text-center">
          <button className="btn btn-primary" onClick={onToggleFullResults}>
            {showFullResults ? (
              <>
                <LuChevronUp size={18} className="me-2" />
                Hide full results {" "}
              </>
            ) : (
              <>
                <LuChevronDown size={18} className="me-2" />
                View full results {" "}
              </>
            )}
            ({reviews.length} reviews)
          </button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ReviewSummary;