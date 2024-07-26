import React from 'react';
import PageLayout from './PageLayout';

const PrivacyPage: React.FC = () => {
  return (
    <PageLayout title="Privacy policy">
      <p className="lead mb-4">
        At TuteReview, we're committed to protecting your privacy while
        providing a valuable service to the university community. This policy
        explains how we collect, use, and protect your information.
      </p>

      <h2>Information we collect</h2>
      <p>When you use TuteReview, we collect:</p>
      <ul>
        <li>Your university Single Sign-On (SSO) details</li>
        <li>The reviews you submit</li>
        <li>Your college and course information</li>
      </ul>

      <h2>How we use your information</h2>
      <p>We use your information to:</p>
      <ul>
        <li>Authenticate users and prevent spam or malicious activity</li>
        <li>Associate reviews with specific colleges and courses</li>
        <li>Maintain the quality and authenticity of our platform</li>
      </ul>

      <h2>Data storage and security</h2>
      <ul>
        <li>
          All reviews are stored securely in a database separate from user
          information
        </li>
        <li>Only site administrators have access to the full database</li>
        <li>
          We never display your name, college, or course alongside your reviews
        </li>
      </ul>

      <h2>Data sharing</h2>
      <ul>
        <li>
          We do not share any personal data with the university or any third
          parties
        </li>
        <li>
          We only display college names for tutor-paper combinations that have
          received three or more reviews, to protect individual anonymity
        </li>
      </ul>

      <h2>Your rights</h2>
      <p>You have the right to:</p>
      <ol>
        <li>See the data we hold about you</li>
        <li>Object to our processing of your data</li>
        <li>Request deletion of your data</li>
      </ol>
      <p>
        To exercise these rights, please email{' '}
        <a href="mailto:tutereview.org+privacy@gmail.com">
          tutereview.org+privacy@gmail.com
        </a>
      </p>

      <h2>Review visibility</h2>
      <ul>
        <li>
          Reviews are visible to anyone with a university SSO, including tutors
          and staff
        </li>
        <li>
          We may in the future make reviews accessible to prospective students
          and the wider public
        </li>
      </ul>

      <h2>Complaints and legal issues</h2>
      <ul>
        <li>
          If you receive a complaint about a review you've submitted, we'll
          contact you via your SSO-linked email
        </li>
        <li>You'll have the option to stand by your review or retract it</li>
        <li>
          We won't share your contact details with complainants unless required
          by a court order
        </li>
      </ul>
      <p className="mt-5 text-muted fst-italic">
        We may update this privacy policy from time to time. Please check back
        regularly for any changes.
      </p>
    </PageLayout>
  );
};

export default PrivacyPage;
