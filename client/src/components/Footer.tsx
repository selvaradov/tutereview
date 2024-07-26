import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="mt-auto py-3">
      <Nav className="justify-content-center">
        <Nav.Item>
          <Nav.Link as={Link} to="/privacy">
            Privacy
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link as={Link} to="/contact">
            Contact
          </Nav.Link>
        </Nav.Item>
      </Nav>
    </footer>
  );
};

export default Footer;
