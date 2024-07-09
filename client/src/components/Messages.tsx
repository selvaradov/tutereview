import { Alert } from 'react-bootstrap';

export const MissingOptionsMessage: React.FC = () => {
  return (
    <Alert variant="info">
    If the subject or paper you're looking for is not listed,
    or the options are incorrect in some way, please contact us at {' '}
    <a href="mailto:tutereview.org+support@gmail.com?subject=Review%20Submission%20Issue&body=Hi,%0D%0A%0D%0AThe%20website%20is%20missing%20an%20option.%0D%0A%0D%0ASubject:%20%0D%0A%0D%0APaper:%20%0D%0A%0D%0AThanks!">tutereview.org+support@gmail.com</a>
    {' '} and we'll sort it as soon as we can.
  </Alert>
  );
};