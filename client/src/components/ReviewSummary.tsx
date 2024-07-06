import React from 'react';
import { Table } from 'react-bootstrap';

interface Review {
  responses: {
    [key: string]: string | number | string[];
  };
}

interface ReviewSummaryProps {
  reviews: Review[];
}

const ReviewSummary: React.FC<ReviewSummaryProps> = ({ reviews }) => {
  const calculateAverageRating = (key: string): string => {
    const ratings = reviews.map(review => Number(review.responses[key])).filter(rating => !isNaN(rating));
    const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    return average.toFixed(1);
  };

  const calculateProportion = (key: string, value: string): string => {
    const count = reviews.filter(review => {
      const response = review.responses[key];
      return Array.isArray(response) ? response.includes(value) : response === value;
    }).length;
    return ((count / reviews.length) * 100).toFixed(1) + '%';
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
    <div className="mb-4">
      <h4>Summary ({reviews.length} reviews)</h4>
      <Table striped bordered hover>
        <tbody>
          <tr>
            <th>Overall Rating</th>
            <td>{calculateAverageRating('rating_overall')} / 5</td>
          </tr>
          <tr>
            <th>Tutorial Rating</th>
            <td>{calculateAverageRating('rating_tutorial')} / 5</td>
          </tr>
          <tr>
            <th>Feedback Rating</th>
            <td>{calculateAverageRating('rating_feedback')} / 5</td>
          </tr>
          <tr>
            <th>Written Feedback - Comments on specific sections</th>
            <td>{calculateProportion('feedback_written', '💬 Yes - I got comments on specific sections')}</td>
          </tr>
          <tr>
            <th>Written Feedback - Overall comment</th>
            <td>{calculateProportion('feedback_written', '📝 Yes - I got an overall comment for the whole submission')}</td>
          </tr>
          <tr>
            <th>Written Feedback - Grade / numerical mark</th>
            <td>{calculateProportion('feedback_written', '🔢 Yes - I got a grade / numerical mark')}</td>
          </tr>
          <tr>
            <th>Verbal Feedback</th>
            <td>{calculateProportion('feedback_verbal', '🗣️ Yes')}</td>
          </tr>
          <tr>
            <th>Pre-Tutorial Work Review</th>
            <td>{calculateProportion('pre_tutorial', '👀 Yes')}</td>
          </tr>
          <tr>
            <th>Most Common Tutorial Length</th>
            <td>{getMostCommonValue('tutorial_length')}</td>
          </tr>
          <tr>
            <th>Most Common Tutorial Structure</th>
            <td>{getMostCommonValue('tutorial_structure')}</td>
          </tr>
          <tr>
            <th>Most Common Tutorial Explanations</th>
            <td>{getMostCommonValue('tutorial_explanations')}</td>
          </tr>
          <tr>
            <th>Most Common Feedback Timeliness</th>
            <td>{getMostCommonValue('feedback_timely')}</td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
};

export default ReviewSummary;