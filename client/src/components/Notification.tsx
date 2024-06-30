import React, { useState, useEffect } from 'react';
import { Alert, Modal, Button } from 'react-bootstrap';
import { useNotification } from '../context/NotificationContext';

const Notification = () => {
  const { message, visible, type, hideNotification } = useNotification();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      setShow(true);
      if (type === 'success') {
        const timer = setTimeout(() => {
          setShow(false);
          hideNotification();
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [visible, type, hideNotification]);

  const handleClose = () => {
    setShow(false);
    hideNotification();
  };

  if (!visible) return null;

  if (type === 'error') {
    return (
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Error</Modal.Title>
        </Modal.Header>
        <Modal.Body>{message}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  return (
    <div className="position-fixed bottom-0 start-50 translate-middle-x mb-3" style={{ zIndex: 1050 }}>
      <Alert
        variant="success"
        show={show}
        onClose={handleClose}
        dismissible
      >
        {message}
      </Alert>
    </div>
  );
};

export default Notification;