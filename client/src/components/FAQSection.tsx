const FAQSection = () => {
  return (
    <div id="faq">
      <h2> FAQ </h2>
      <h3>Are all my submissions anonymous?</h3>
      <p>
        Yes. We will never attach your name to any of the feedback
        which is submitted. However, to make the site is as useful as possible, we <em>will</em> display
        alongside your review (a) the month & year of submission, and (b) your college.
      </p>
      <h3> So why do I need to log in?</h3>
      <p>
        We want to maintain a high-quality platform where the authenticity of feedback
        is not in doubt. By requiring users to log in with their SSO, we
        are able to take appropriate steps to prevent spam or malicious activity,
        and to ensure that only current students are able to submit reviews. In order
        to do this, and to fulfill our legal duties, we associate each submission
        with your SSO details and securely store this information. We will never display it publicly.
      </p>
      <h3> What should I do if I have an issue?</h3>
      <p>
        If you have any questions or problems with the site functionality,
        or are interested in helping us grow,
        please reach out at <a href="mailto:tutereview.org+support@gmail.com">tutereview.org+support@gmail.com</a>.
        For legal complaints, contact <a href="mailto:tutereview.org+legal@proton.me">tutereview.org+legal@gmail.com</a> and
        we will respond in line with our statutory obligations.
      </p>
    </div>
  );
};

export default FAQSection;