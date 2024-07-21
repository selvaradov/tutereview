const FAQSection = () => {
  return (
    <div id="faq">
      <h2> FAQ </h2>
      <h3>Are all my submissions anonymous?</h3>
      <p>
        Yes. We will never reveal your name, college or course alongside your review.
        However, in order to enable users to compare the offerings from different colleges
        for each subject, we will list with each tutor-paper combination the names
        of the colleges from which we have received three or more reviews. 
        We believe this will still protect your anonymity, because
        (a) your college is not displayed directly with the review, and
        (b) the number of reviews required to display a college is high enough
        that it will not be possible to reliably associate a given review with
        any individual student.
        In addition, if a review was submitted more than three years ago,
        we will display a message to this effect beside it.
        If you have any questions or concerns about this, or would like to suggest
        changes to our policy, please email <a href="mailto:tutereview.org+support@gmail.com">tutereview.org+support@gmail.com</a>.
      </p>
      <h3>Could my tutor see the reviews?</h3>
      <p>
        Yes, the site is accessible to anybody with a university SSO, including tutors and 
        other staff. We may in future open up access to the wider public so prospective
        students are able to make decisions about colleges and courses. Please bear this
        in mind when writing your reviews, and ensure they're both accurate and fair.
      </p>
      <h3> Why do I need to log in?</h3>
      <p>
        We want to maintain a high-quality platform where the authenticity of feedback
        is not in doubt. By requiring users to log in with their single sign-on (SSO), we
        are able to take appropriate steps to prevent spam or malicious activity,
        and to ensure that only current students are able to submit reviews. Linking reviews
        to user accounts also makes it easier to keep track of which colleges a tutor teaches
        at, information we use as outlined above. In order to fulfill these legitimate interests,
        and to comply with our legal duties, we associate each submission
        with your SSO details and securely store this information. We will never display it publicly.
        If you want to see the data that we hold on you, object to our processing of it, or request
        that it be deleted, please email <a href="mailto:tutereview.org+privacy@gmail.com">tutereview.org+privacy@gmail.com</a>.
      </p>
      <h3>What do you mean, "comply with our legal duties"?</h3>
      <p>
        We need to have your contact details available so that we're able to get in touch
        in the unlikely event that a complaint is made about a review you've submitted. In this
        instance, you would be given the option to either stand by your review or retract it.
        Whilst we can't offer legal advice, we note that UK law protects your right to make
        "substantially true" statements about someone, and to express an "honest opinion" about them, even if 
        doing so causes (or is likely to cause) serious harm to their reputation.
        We'd never share your contact details with the complainant without you instructing us to do
        so, unless compelled to by a court order.
      </p>
      <h3>Could the university see what reviews I've submitted?</h3>
      <p>
        No, we are entirely independent of the university and do not share any data with them.
        All your reviews are stored in a secure database separately
        from user information, and are only visible to the site administrators.
        University administrators may be able to see that you have created an account
        on the site (since you do so using your SSO), but they will not know the content of your reviews, or even 
        whether you have submitted any.
      </p>
      <h3>Can I edit or delete my reviews after submission?</h3>
      <p>
        No, there is currently no way to edit or delete reviews, but you are able
        to see all your submitted reviews under the "Account" section of the menu.
        If you realise you made a mistake or error, please
        email <a href="mailto:tutereview.org+support@gmail.com">tutereview.org+support@gmail.com</a> and
        we can make any manual corrections required.
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