import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import logo from '../img/logo860.png';
import './HeaderNavbar.css';

const HeaderNavbar: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();

  return (
    <Navbar expand="lg" className="mb-3">
      <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
        <img
          src={logo}
          width="60"
          height="auto"
          className="d-inline-block align-top me-2"
          alt="TuteReview Logo"
        />
        TuteReview
      </Navbar.Brand>
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
          <Nav className="ms-auto">
            <NavDropdown title="Account" id="basic-nav-dropdown">
              <NavDropdown.Item as={Link} to="/profile">Profile</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/my-reviews">My reviews</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={logout} className="dropdown-logout-button">
                Log out
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        )}
      </Navbar.Collapse>
    </Navbar>
  );
};

export default HeaderNavbar;