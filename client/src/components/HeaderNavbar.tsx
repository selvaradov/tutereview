import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';

const HeaderNavbar: React.FC = () => {
  const { isAuthenticated, login, logout } = useAuth();
  const location = useLocation();

  const handleAuth = () => {
    if (isAuthenticated) {
      logout();
    } else {
      login();
    }
  };

  return (
    <Navbar bg="light" expand="lg" className="mb-3">
      <Container>
        <Navbar.Brand as={Link} to="/">My App</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" active={location.pathname === '/'}>Home</Nav.Link>
            {isAuthenticated && (
              <>
                <Nav.Link as={Link} to="/review" active={location.pathname === '/review'}>Review</Nav.Link>
                <Nav.Link as={Link} to="/search" active={location.pathname === '/search'}>Search</Nav.Link>
              </>
            )}
          </Nav>
          <Button variant={isAuthenticated ? "outline-danger" : "outline-primary"} onClick={handleAuth}>
            {isAuthenticated ? "Log Out" : "Log In"}
          </Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default HeaderNavbar;