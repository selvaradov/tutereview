import React from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Button } from 'react-bootstrap';
import {
  FaSearch,
  FaMicrosoft,
  FaPencilAlt,
  FaUserCircle,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

interface CTAButtonsProps {
  primaryVariant: string;
  secondaryVariant: string;
  singleButtonAlignment?: 'left' | 'center';
}

const CTAButtons: React.FC<CTAButtonsProps> = ({
  primaryVariant,
  secondaryVariant,
  singleButtonAlignment = 'left',
}) => {
  const { isAuthenticated, isProfileComplete, login } = useAuth();

  const singleButtonColClass =
    singleButtonAlignment === 'center' ? 'text-center' : '';

  const renderSingleButton = (
    content: React.ReactNode,
    to?: string,
    onClick?: () => void,
  ) => (
    <Row className="mt-4">
      <Col xs={12} className={`mb-3 ${singleButtonColClass}`}>
        {to ? (
          <Link to={to}>
            <Button
              variant={primaryVariant}
              size="lg"
              className="d-inline-flex align-items-center"
            >
              {content}
            </Button>
          </Link>
        ) : (
          <Button
            variant={primaryVariant}
            size="lg"
            onClick={onClick}
            className="d-inline-flex align-items-center"
          >
            {content}
          </Button>
        )}
      </Col>
    </Row>
  );

  return (
    <div className="call-to-action">
      {!isAuthenticated ? (
        renderSingleButton(
          <>
            <FaMicrosoft className="me-2" />
            Continue with Microsoft
          </>,
          undefined,
          login,
        )
      ) : isProfileComplete ? (
        <Row className="mt-4">
          <Col xs={12} md={6} className="mb-3">
            <Link to="/review">
              <Button
                variant={primaryVariant}
                size="lg"
                className="d-inline-flex align-items-center w-100"
              >
                <FaPencilAlt className="me-2" />
                Write a review
              </Button>
            </Link>
          </Col>
          <Col xs={12} md={6}>
            <Link to="/search">
              <Button
                variant={secondaryVariant}
                size="lg"
                className="d-inline-flex align-items-center w-100"
              >
                <FaSearch className="me-2" />
                Search submissions
              </Button>
            </Link>
          </Col>
        </Row>
      ) : (
        renderSingleButton(
          <>
            <FaUserCircle className="me-2" />
            Complete your profile
          </>,
          '/profile',
        )
      )}
    </div>
  );
};

export default CTAButtons;
