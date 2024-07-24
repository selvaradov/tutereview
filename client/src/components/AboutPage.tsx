import { Row, Col, Card } from 'react-bootstrap';
import { FaQuoteLeft } from 'react-icons/fa';
import CTAButtons from './CTAButtons';
import InfoPopover from './InfoPopover';

const AboutPage = () => {
  return (
    <div className="about-page">
      <h1 className="display-4 text-center mb-5">About TuteReview</h1>

      <Row className="mb-5">
        <Col lg={8} className="mx-auto">
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <blockquote className="blockquote mb-0">
                <p>
                  <FaQuoteLeft className="me-2 text-primary" />
                  The tutor who hasn't marked your work a month after it was
                  submitted; the one who never looks at the clock and realises
                  with 10 minutes to go that they've not started giving you
                  feedback yet; the one who'd rather do anything than give a
                  straight answer to the question you asked.
                </p>
                <strong>
                  We've all been there — but it doesn't have to be this way.
                </strong>
              </blockquote>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-5">
        <Col lg={10} className="mx-auto text-center">
          <h2 className="mb-4">Join the community</h2>
          <p className="lead mb-4">
            Help us build a more informed and empowered student body. Share your
            experiences, discover great tutors, and make the most of the
            university's academic opportunities with TuteReview.
          </p>
          <CTAButtons
            primaryVariant="primary"
            secondaryVariant="outline-primary"
            singleButtonAlignment="center"
          />
        </Col>
      </Row>

      <Row className="mb-5">
        <Col lg={8} className="mx-auto">
          <h2 className="mb-4">Our mission</h2>
          <p className="lead">
            There are many fantastic tutors and fascinating papers out there. We
            want more people to know about them.
          </p>
          <p>
            Part of what makes Oxford and Cambridge academically distinctive is
            the collegiate system, and there's always going to be variation in
            teaching between colleges and courses. What <em>isn't</em>{' '}
            inevitable is students having no idea about how their tutorials or
            supervisions will be until they've started and it's too late to
            change.
          </p>
          <p>
            With so many potential combinations of subject, college, and paper,
            it often isn't possible to ask someone you know how they found the
            module that you're considering. This is where TuteReview comes in.
          </p>
        </Col>
      </Row>

      <Row className="mb-5">
        <Col lg={8} className="mx-auto">
          <h2 className="mb-4">How we work</h2>
          <p>
            We're a platform for students to anonymously share feedback on their
            papers and tutors or supervisors, helping others to make informed
            decisions. If you've seen American sites like RateMyProfessors
            before, where most reviews are students complaining that a class was
            graded too harshly or that they lost marks for handing in work late,
            you should know now that we're different by design.
          </p>
          <p>
            The questions we ask are there so that others can know what to
            expect from selecting a particular module, and decide whether it's
            right for them.
          </p>
        </Col>
      </Row>

      <Row className="mb-5">
        <Col lg={8} className="mx-auto">
          <h2 className="mb-4">Empowering student choices</h2>
          <p>
            As students, we get a lot of choice in what papers to take, plus
            there's often much more flexibility around tutors/supervisors than
            you might imagine.
            <InfoPopover
              content={
                <span>
                  For instance, see the first full paragraph on{' '}
                  <a
                    href="https://www.ppe.ox.ac.uk/sitefiles/ppe-handbook-prelims-2023-24-final-1.0.pdf#page=11"
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-primary"
                  >
                    page 11 of the PPE handbook
                  </a>
                </span>
              }
            />
          </p>
          <p>
            Given the absence of information about what different papers and
            tutors/supervisors would be like, this choice is pretty meaningless,
            though. We think that can and should change, and we hope you join us
            on the mission.
          </p>
        </Col>
      </Row>

      <Row className="mb-5">
        <Col lg={8} className="mx-auto">
          <h2 className="mb-3">Future developments</h2>
          <p>
            Currently TuteReview is only available to those at the University of
            Oxford but we're aiming to open it up to Cambridge students shortly.
            Eventually, the plan is to make the reviews available to prospective
            students so that they can have a sense of what academic life in
            their chosen subject is really like at each college.
          </p>
        </Col>
      </Row>
    </div>
  );
};

export default AboutPage;
