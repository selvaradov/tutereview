import { Row, Col, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaSearch, FaLightbulb, FaComments, FaChevronDown } from 'react-icons/fa';
import { GiBookshelf } from "react-icons/gi";
import CTAButtons from './CTAButtons';
import './HomePage.css';

const HomePage = () => {
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('our-features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };
  return (
    <>
      <section className="hero-section" id="hero">
        <div className="h-100 d-flex flex-column">
          <div className="hero-content mx-4">
            <Row className="align-items-center">
              <Col lg={6}>
                <h1 className="display-4 fw-bold mb-4">Welcome to TuteReview</h1>
                <p className="lead mb-4">Helping cast some light among the shadows of dark academia.</p>
              </Col>
              <Col lg={6} className="mt-lg-0 text-center d-none d-lg-block">
                <GiBookshelf style={{ fontSize: '15rem', opacity: 0.8 }} />
              </Col>
            </Row>
            <CTAButtons primaryVariant="warning" secondaryVariant="outline-light" />
          </div>
        </div>
        <div className="chevron-container">
          <FaChevronDown
            className="scroll-chevron"
            onClick={scrollToFeatures}
            aria-label="Scroll to Our Features"
          />
        </div>
      </section>

      <section className="py-3 my-3" id="our-features">
          <h2 className="text-center">Our features</h2>
          <Row>
            <Col md={4} className="mb-4">
              <Card className="h-100 shadow-sm border-0">
                <Card.Body className="text-center">
                  <FaComments className="fs-1 text-primary mb-3" />
                  <Card.Title className="fs-4 mb-3 px-3">Anonymous Feedback</Card.Title>
                  <Card.Text>
                    Share your experiences with fellow students and recognise your best tutors.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100 shadow-sm border-0">
                <Card.Body className="text-center">
                  <FaLightbulb className="fs-1 text-success mb-3" />
                  <Card.Title className="fs-4 mb-3 px-3">Informed Decisions</Card.Title>
                  <Card.Text>
                    Make better choices about your papers and tutors based on others' advice.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100 shadow-sm border-0">
                <Card.Body className="text-center">
                  <FaSearch className="fs-1 text-warning mb-3" />
                  <Card.Title className="fs-4 mb-3 px-3">Easy Exploration</Card.Title>
                  <Card.Text>
                    Quickly find and compare reviews for specific papers, tutors, or colleges.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
      </section>

      <section className="py-3 my-3" id="about-us">
          <Row>
            <Col lg={8} className="mx-auto">
              <h2 className="text-center">About us</h2>
              <p>
                TuteReview is a platform for students to anonymously share feedback on their papers and tutors or supervisors, helping others to make informed decisions. We're different from other review sites by design, focusing on providing meaningful information to help students choose the right papers and understand what to expect.
              </p>
              <p>
                We're currently available to students at the University of Oxford and hope to expand to Cambridge soon. Our goal is to make academic life more transparent and help students make the most of their university experience.
              </p>
              <div className="text-center mt-4">
                <Row className="justify-content-center">
                  <Col xs={10} sm={8} md={6} className="mb-2 mb-md-0">
                    <Link to="/about">
                      <Button variant="outline-primary" className="w-100">Read about our mission</Button>
                    </Link>
                  </Col>
                  <Col xs={10} sm={8} md={6}>
                    <Link to="/faq">
                      <Button variant="outline-primary" className="w-100">Explore the FAQ</Button>
                    </Link>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
      </section>
    </>
  );
};

export default HomePage;