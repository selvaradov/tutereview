import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import logo from '../img/logo860.png';
import './HeaderNavbar.css';
import { checkNavigation } from './navigationUtils';

const HeaderNavbar: React.FC = () => {
  const { isAuthenticated, logout, isProfileComplete } = useAuth();
  const location = useLocation();
  const { showNotification } = useNotification();

  const handleNavClick = (to: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!checkNavigation(to, isAuthenticated, isProfileComplete, showNotification)) {
      e.preventDefault();
    }
  };

  return (
    <Navbar expand="lg" className="mb-3">
      <Navbar.Brand as={Link} to="/" onClick={handleNavClick('/')} className="d-flex align-items-center">
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
          <Nav.Link as={Link} to="/" onClick={handleNavClick('/')} active={location.pathname === '/'}>Home</Nav.Link>
          <Nav.Link as={Link} to="/about" onClick={handleNavClick('/about')} active={location.pathname === '/about'}>About</Nav.Link>
          {isAuthenticated && (
            <>
              <Nav.Link as={Link} to="/review" onClick={handleNavClick('/review')} active={location.pathname === '/review'}>Submit a review</Nav.Link>
              <Nav.Link as={Link} to="/search" onClick={handleNavClick('/search')} active={location.pathname === '/search'}>Search</Nav.Link>
            </>
          )}
          <Nav.Link as={Link} to="/faq" onClick={handleNavClick('/faq')} active={location.pathname === '/faq'}>FAQ</Nav.Link>
        </Nav>
        {isAuthenticated && (
          <Nav className="ms-lg-auto">
            <NavDropdown title="Account" id="basic-nav-dropdown" align={{ lg: 'end' }} style={{ textAlign: "center" }}>
              <NavDropdown.Item as={Link} to="/profile" onClick={handleNavClick('/profile')}>Profile</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/my-reviews" onClick={handleNavClick('/my-reviews')}>My reviews</NavDropdown.Item>
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