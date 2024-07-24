import { Alert } from 'react-bootstrap';

export const MissingOptionsMessage: React.FC = () => {
  const email = 'tutereview.org+support@gmail.com';
  const subject = encodeURIComponent('Review Submission Issue');
  const body = encodeURIComponent(`Hi,

The website is missing an option.

Subject:

Paper:

Thanks!`);

  const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;
  return (
    <Alert variant="secondary">
      If the subject or paper you're looking for is not listed, or the options
      are incorrect in some way, please contact us at{' '}
      <a href={mailtoLink} className="alert-link">
        tutereview.org+support@gmail.com
      </a>{' '}
      and we'll sort it as soon as we can.
    </Alert>
  );
};
