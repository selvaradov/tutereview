import { useState } from 'react';
import { Accordion, Button } from 'react-bootstrap';
import PageLayout from './PageLayout';

const faqData = [
  {
    "question": "Are all my submissions anonymous?",
    "answer": "Yes. We will never reveal your name, college or course alongside your review. However, in order to enable users to compare the offerings from different colleges for each subject, we will list with each tutor-paper combination the names of the colleges from which we have received three or more reviews. We believe this will still protect your anonymity, because (a) your college is not displayed directly with the review, and (b) the number of reviews required to display a college is high enough that it will not be possible to reliably associate a given review with any individual student. In addition, if a review was submitted more than three years ago, we will display a message to this effect beside it. If you have any questions or concerns about this, or would like to suggest changes to our policy, please email {{support}}."
  },
  {
    "question": "Could my tutor see the reviews?",
    "answer": "Yes, the site is accessible to anybody with a university SSO, including tutors and other staff. We may in future open up access to the wider public so prospective students are able to make decisions about colleges and courses. Please bear this in mind when writing your reviews, and ensure they're both accurate and fair."
  },
  {
    "question": "What happens if I write something my tutor doesn't like?",
    "answer": "We hope it'll never come to this, and that everyone involved acts with courtesy and consideration, but in the unlikely event that a complaint is made about a review you've submitted, we'll get in touch with you using the SSO-linked email address we have on file. You would then be given the option to either stand by your review or retract it. Whilst we can't offer legal advice, we note that UK law protects your right to make \"substantially true\" statements about someone, and to express an \"honest opinion\" about them, even if doing so causes (or is likely to cause) serious harm to their reputation. We'd never share your contact details with the complainant without you instructing us to do so, unless compelled to by a court order."
  },
  {
    "question": "Why do I need to log in?",
    "answer": "We want to maintain a high-quality platform where the authenticity of feedback is not in doubt. By requiring users to log in with their single sign-on (SSO), we are able to take appropriate steps to prevent spam or malicious activity, and to ensure that only current students are able to submit reviews. Linking reviews to user accounts also makes it easier to keep track of which colleges a tutor teaches at, information we use as outlined above. In order to fulfill these legitimate interests, and to comply with our legal duties as explained above, we associate each submission with your SSO details and securely store this information. We will never display it publicly. If you want to see the data that we hold on you, object to our processing of it, or request that it be deleted, please email {{privacy}}."
  },
  {
    "question": "Could the university see what reviews I've submitted?",
    "answer": "No, we are entirely independent of the university and do not share any data with them. All your reviews are stored in a secure database separately from user information, and are only visible to the site administrators. University administrators may be able to see that you have created an account on the site (since you do so using your SSO), but they will not know the content of your reviews, or even whether you have submitted any."
  },
  {
    "question": "Can I edit or delete my reviews after submission?",
    "answer": "No, there is currently no way to edit or delete reviews, but you are able to see all your submitted reviews under the \"Account\" section of the menu. If you realise you made a mistake or error, please email {{support}} and we can make any manual corrections required."
  },
  {
    "question": "How do I get in touch if there's an issue?",
    "answer": "If you have any questions or problems with the site functionality, or are interested in helping us grow, please reach out at {{support}}. For legal complaints, contact {{legal}} and we will respond in line with our statutory obligations."
  }
]

const emailAddresses = {
  support: "tutereview.org+support@gmail.com",
  legal: "tutereview.org+legal@gmail.com",
  privacy: "tutereview.org+privacy@gmail.com",
};

const createMailtoLink = (email: string) => {
  return `<a href="mailto:${email}">${email}</a>`;
};

const replaceEmailPlaceholders = (text: string): string => {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const email = emailAddresses[key as keyof typeof emailAddresses];
    return email ? createMailtoLink(email) : `{{${key}}}`;
  });
};

const FAQPage: React.FC = () => {
  const [activeKeys, setActiveKeys] = useState<string[]>([]);

  const toggleItem = (key: string) => {
    setActiveKeys(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const toggleAll = () => {
    setActiveKeys(activeKeys.length === faqData.length ? [] : faqData.map((_, index) => index.toString()));
  };

  return (
    <PageLayout title="Frequently asked questions">
      <Button
        variant="link"
        onClick={toggleAll}
        className="p-0 mb-2"
      >
        {activeKeys.length === faqData.length ? 'Collapse all' : 'Expand all'}
      </Button>
      <Accordion activeKey={activeKeys}>
        {faqData.map((item, index) => (
          <Accordion.Item eventKey={index.toString()} key={index}>
            <Accordion.Header onClick={() => toggleItem(index.toString())}>
              {item.question}
            </Accordion.Header>
            <Accordion.Body dangerouslySetInnerHTML={{ __html: replaceEmailPlaceholders(item.answer) }} />
          </Accordion.Item>
        ))}
      </Accordion>
    </PageLayout>
  );
};

export default FAQPage;