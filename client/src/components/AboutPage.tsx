import PageLayout from "./PageLayout";

const AboutPage = () => {
  return (
    <PageLayout title="About">
      <p>
        The tutor who hasn't marked your work a month after it was submitted; the one who
        never looks at the clock and realises with 10 minutes to go that they've not started
        giving you feedback yet; the one who'd rather do anything than give a straight answer
        to the question you asked. We've all been there — but it doesn't have to be this way!
        There are many fantastic tutors and fascinating papers out there, and it would be great
        if more people could find them. 
      </p>
      <p>
        There's always going to be variation in teaching between colleges and courses: that's part
        of what makes Oxford and Cambridge academically distinctive. What <em>isn't</em> inevitable
        is students having no idea about how their tutorials or supervisions will be until they've
        started and it's too late to change. However, with so many potential combinations of subject, college
        and paper, it often isn't possible to ask someone you know how they found the module that
        you're considering.
      </p>
      <p>
        This is where TuteReview comes in. We're an anonymous platform for students to share feedback on
        their papers and tutors or supervisors, helping others to make informed decisions.
        If you've seen American sites like RateMyProfessors before, where most reviews are students
        complaining that a class was graded too harshly or that they lost marks for handing in work late,
        you should know now that we're different by design. The questions we ask are there so that others can know
        what to expect from selecting a particular module, and decide whether it's right for them.
        As students, we get a lot of choice in what papers to take, plus there's often much more
        flexibility around tutors/supervisors than you might imagine (for instance, see the first
        full paragraph on <a href="https://www.ppe.ox.ac.uk/sitefiles/ppe-handbook-prelims-2023-24-final-1.0.pdf#page=11" target="_blank" rel="noreferrer">
          page 11 of the PPE handbook</a>). Given the absence of information about what different
        papers and tutors/supervisors would be like, this choice is pretty meaningless, though.
        We think that can and should change, and we hope you join us on the mission.
      </p>
      <p>
        Currently TuteReview is only available to those at the University of Oxford but
        we're aiming to open it up to Cambridge students shortly. Eventually, the plan is to
        make the reviews available to prospective students so that they can have a sense
        of what academic life in their chosen subject is really like at each college.
      </p>
    </PageLayout>
  );
};

export default AboutPage;