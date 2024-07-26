import React from 'react';
import PageLayout from './PageLayout';

const ContactPage: React.FC = () => {
  return (
    <PageLayout title="Contact us">
      <ul>
        <li>
          For general inquiries or technical support:{' '}
          <a href="mailto:tutereview.org+support@gmail.com">
            tutereview.org+support@gmail.com
          </a>
        </li>
        <li>
          For legal issues:{' '}
          <a href="mailto:tutereview.org+legal@gmail.com">
            tutereview.org+legal@gmail.com
          </a>
        </li>
        <li>
          For privacy concerns:{' '}
          <a href="mailto:tutereview.org+privacy@gmail.com">
            tutereview.org+privacy@gmail.com
          </a>
        </li>
      </ul>
    </PageLayout>
  );
};

export default ContactPage;
