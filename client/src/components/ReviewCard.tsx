import React from 'react';
import { Card, Table, ListGroup } from 'react-bootstrap';
import { Review, ResponseValue } from '../types';
import StarRating from './StarRating';

interface ReviewCardProps {
  review: Review;
}

const questionTitles: Record<string, string> = {
  pre_tutorial: 'Looked at Work Pre-Tutorial',
  feedback_timely: 'Feedback Timeliness',
  rating_feedback: 'Feedback Rating',
  tutorial_length: 'Tutorial Length',
  tutorial_structure: 'Tutorial Focus',
  tutorial_explanations: 'Tutorial Explanations',
  rating_tutorial: 'Tutorial Rating',
  rating_overall: 'Overall Rating',
  comments: 'Additional Comments',
  feedback_written: 'Written Feedback',
  feedback_verbal: 'Verbal Feedback',
};

const questionOptions: Record<string, Record<string, string>> = {
  feedback_written: {
    'Comments on specific sections':
      '💬 Yes - I got comments on specific sections',
    'Overall comment for the whole submission':
      '📝 Yes - I got an overall comment for the whole submission',
    'Grade / numerical mark': '🔢 Yes - I got a grade / numerical mark',
  },
};

const displayOrder = [
  'rating_overall',
  'rating_tutorial',
  'tutorial_explanations',
  'pre_tutorial',
  'tutorial_length',
  'tutorial_structure',
  'rating_feedback',
  'feedback_written',
  'feedback_verbal',
  'feedback_timely',
  'comments',
];

const ScoreCard: React.FC<{
  options: Record<string, string>;
  selectedOptions: string[];
}> = ({ options, selectedOptions }) => {
  return (
    <Table striped bordered hover size="sm">
      <tbody>
        {Object.entries(options).map(([key, value]) => (
          <tr key={key}>
            <td>{key}</td>
            <td className="text-center">
              {selectedOptions.includes(value) ? '✅' : '❌'}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

const renderValue = (key: string, value: ResponseValue) => {
  if (Array.isArray(value) && questionOptions[key]) {
    return <ScoreCard options={questionOptions[key]} selectedOptions={value} />;
  } else if (Array.isArray(value)) {
    return (
      <ListGroup>
        {value.map((item, index) => (
          <ListGroup.Item key={index}>{item}</ListGroup.Item>
        ))}
      </ListGroup>
    );
  } else if (
    typeof value === 'number' &&
    ['rating_feedback', 'rating_tutorial', 'rating_overall'].includes(key)
  ) {
    return <StarRating rating={value} decimal={0} />;
  } else {
    return value;
  }
};

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  return (
    <Card className="mb-3">
      <Card.Body>
        <Card.Title
          as="h3"
          className="fs-4"
        >{`${review.responses.paperName} (${review.responses.paperLevel}) - ${review.responses.tutor}`}</Card.Title>
        {review.isOld && (
          <Card.Subtitle className="mb-2 text-muted">
            This review is more than three years old.
          </Card.Subtitle>
        )}

        {displayOrder.map((key) => {
          const value = review.responses[key];
          if (value !== undefined && value !== '') {
            return (
              <div key={key} className="mb-2">
                <strong>
                  {questionTitles[key] ||
                    key.charAt(0).toUpperCase() + key.slice(1)}
                  :{' '}
                </strong>
                {renderValue(key, value)}
              </div>
            );
          }
          return null;
        })}
      </Card.Body>
    </Card>
  );
};

export default ReviewCard;
