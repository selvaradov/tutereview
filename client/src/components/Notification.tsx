import React, { useState, useEffect } from 'react';
import { Alert, Modal, Button } from 'react-bootstrap';
import { useNotification } from '../context/NotificationContext';

const Notification = () => {
  const { message, visible, type, hideNotification } = useNotification();
  const [show, setShow] = useState(false);

  // Success notifications should disappear after 5 seconds
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

  // Ensure modal shadow covers scrollbar
  useEffect(() => {
    if (show && type === 'error') {
      // Save original styles
      const originalStyle = {
        scrollbarGutter: document.documentElement.style.getPropertyValue('scrollbar-gutter'),
      };
      // Apply new styles
      document.documentElement.style.setProperty('scrollbar-gutter', 'unset');
      // Revert to original styles on cleanup
      return () => {
        document.documentElement.style.setProperty('scrollbar-gutter', originalStyle.scrollbarGutter);
      };
    }
  }, [show, type]);

  const handleClose = () => {
    setShow(false);
    hideNotification();
  };

  if (!visible) return null;

  if (type === 'error') {
    return (
      <Modal
        show={show}
        onHide={handleClose}
        centered
        dialogClassName="modal-90w"
        contentClassName="mx-3"
      >
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
    <div className="notification-wrapper">
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