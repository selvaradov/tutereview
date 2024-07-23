import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import HeaderNavbar from './HeaderNavbar';

interface LayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Container>
      <Row> {/* To centre content, add `className="justify-content-center align-items-center"` */}
        <Col xs={12} lg={10} xl={8}>
          <HeaderNavbar />
          <div className="content-wrapper mb-4">
            {children}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default AppLayout;