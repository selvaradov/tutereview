import React from 'react';
import { Card, Table, ListGroup } from 'react-bootstrap';

interface Review {
  _id: string;
  responses: {
    tutor: string;
    subject: string;
    paperCode: string;
    paperName: string;
    paperLevel: string;
    [key: string]: string | number | string[];
  };
  submittedAt: string;
}

interface ReviewCardProps {
  review: Review;
  showCollege?: boolean;
  collegeLookup?: Map<string, string>;
}

const questionTitles: { [key: string]: string } = {
  pre_tutorial: "Pre-Tutorial Work Review",
  feedback_timely: "Feedback Timeliness",
  rating_feedback: "Feedback Rating",
  tutorial_length: "Tutorial Length",
  tutorial_structure: "Tutorial Focus",
  tutorial_explanations: "Tutorial Explanations",
  rating_tutorial: "Tutorial Rating",
  rating_overall: "Overall Rating",
  comments: "Additional Comments",
  feedback_written: "Written Feedback",
  feedback_verbal: "Verbal Feedback",
};

const questionOptions: { [key: string]: { [key: string]: string } } = {
  feedback_written: {
    "Comments on specific sections": "💬 Yes - I got comments on specific sections",
    "Overall comment for the whole submission": "📝 Yes - I got an overall comment for the whole submission",
    "Grade / numerical mark": "🔢 Yes - I got a grade / numerical mark"
  }
};

const displayOrder = [
  "rating_overall",
  "rating_tutorial",
  "tutorial_explanations",
  "pre_tutorial",
  "tutorial_length",
  "tutorial_structure",
  "rating_feedback",
  "feedback_written",
  "feedback_verbal",
  "feedback_timely",
  "comments"
];

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <span>
      {[...Array(5)].map((_, i) => (
        <span key={i} style={{color: i < rating ? "#ffc107" : "#e4e5e9"}}>★</span>
      ))}
    </span>
  );
};

const ScoreCard: React.FC<{ options: { [key: string]: string }, selectedOptions: string[] }> = ({ options, selectedOptions }) => {
  return (
    <Table striped bordered hover size="sm">
      <tbody>
        {Object.entries(options).map(([key, value]) => (
          <tr key={key}>
            <td>{key}</td>
            <td className="text-center">
              {selectedOptions.includes(value) ? "✅" : "❌"}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

const renderValue = (key: string, value: string | number | string[]) => {
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
  } else if (typeof value === 'number' && ['rating_feedback', 'rating_tutorial', 'rating_overall'].includes(key)) {
    return <StarRating rating={value} />;
  } else {
    return value;
  }
};

const ReviewCard: React.FC<ReviewCardProps> = ({ review, showCollege = false, collegeLookup }) => {
  return (
    <Card className="mb-3">
      <Card.Body>
        <Card.Title>{`${review.responses.paperName} (${review.responses.paperLevel}) - ${review.responses.tutor}`}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">
          Submitted: {new Date(review.submittedAt).toLocaleDateString("en-GB", { year: 'numeric', month: 'long', day: 'numeric' })}
        </Card.Subtitle>
        {showCollege && collegeLookup && (
          <p><em>College: {collegeLookup.get(review.responses.college as string) || review.responses.college}</em></p>
        )}
        {displayOrder.map((key) => {
          const value = review.responses[key];
          if (value !== undefined && value !== "") { 
            return (
              <div key={key} className="mb-2">
                <strong>{questionTitles[key] || key.charAt(0).toUpperCase() + key.slice(1)}: </strong>
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