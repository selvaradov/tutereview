import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import HeaderNavbar from './HeaderNavbar';

interface LayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Container>
      <Row>
        <Col xs={12} lg={10} xl={8}>
          <HeaderNavbar />
          <Container className="content-wrapper">
            {children}
          </Container>
        </Col>
      </Row>
    </Container>
  );
};

export default AppLayout;