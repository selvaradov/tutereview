import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';

const HeaderNavbar: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();

  return (
    <Navbar expand="lg" className="mb-3">
        <Navbar.Brand as={Link} to="/">TuteReview</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" active={location.pathname === '/'}>Home</Nav.Link>
            {isAuthenticated && (
              <>
                <Nav.Link as={Link} to="/review" active={location.pathname === '/review'}>Submit a review</Nav.Link>
                <Nav.Link as={Link} to="/search" active={location.pathname === '/search'}>Search</Nav.Link>
              </>
            )}
          </Nav>
          {isAuthenticated && (
            <Button variant="outline-danger" onClick={logout}>
              Log Out
            </Button>
          )}
        </Navbar.Collapse>
    </Navbar>
  );
};

export default HeaderNavbar;