import { Link } from 'react-router-dom';
import { Row, Col, Button } from 'react-bootstrap';
import { FaSearch, FaMicrosoft, FaPencilAlt, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

interface CTAButtonsProps {
  primaryVariant: string;
  secondaryVariant: string;
}

const CTAButtons = ({ primaryVariant, secondaryVariant }: CTAButtonsProps) => {
  const { isAuthenticated, isProfileComplete, login } = useAuth();
  return (
    <div className="call-to-action">
      {!isAuthenticated ? (
        <Row className="mt-4">
          <Col xs={12} md={6} className="mb-3">
            <Button variant={primaryVariant} size="lg" onClick={login} className="d-inline-flex align-items-center w-100">
              <FaMicrosoft className="me-2" />
              Continue with Microsoft
            </Button>
          </Col>
        </Row>
      ) : isProfileComplete ? (
        <Row className="mt-4">
          <Col xs={12} md={6} className="mb-3">
            <Link to="/review">
              <Button variant={primaryVariant} size="lg" className="d-inline-flex align-items-center w-100">
                <FaPencilAlt className="me-2" />
                Write a review
              </Button>
            </Link>
          </Col>
          <Col xs={12} md={6}>
            <Link to="/search">
              <Button variant={secondaryVariant} size="lg" className="d-inline-flex align-items-center w-100">
                <FaSearch className="me-2" />
                Search submissions
              </Button>
            </Link>
          </Col>
        </Row>
      ) : (
        <Row className="mt-4">
          <Col xs={12} md={6} className="mb-3">
            <Link to="/profile">
              <Button variant={primaryVariant} size="lg" className="d-inline-flex align-items-center w-100">
                <FaUserCircle className="me-2" />
                Complete your profile
              </Button>
            </Link>
          </Col>
        </Row>
      )}
    </div>
  )
}

export default CTAButtons;