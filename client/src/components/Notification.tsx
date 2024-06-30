import React, { useState, useEffect } from 'react';
import { Alert, Modal, Button } from 'react-bootstrap';
import { useNotification } from '../context/NotificationContext';

type AdditionalButton = {
  label: string;
  onClick: () => void;
  variant?: string;
};

const Notification = () => {
  const { message, visible, type, hideNotification, additionalButtons } = useNotification();
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
        overflow: document.documentElement.style.getPropertyValue('overflow'),
      };
      // Apply new styles
      document.documentElement.style.setProperty('scrollbar-gutter', 'unset');
      document.documentElement.style.setProperty('overflow', 'hidden');
      document.body.style.setProperty('padding-right', `0px`); // Otherwise padding-right gets set to 15px
      // Revert to original styles on cleanup
      return () => {
        document.documentElement.style.setProperty('scrollbar-gutter', originalStyle.scrollbarGutter);
        document.documentElement.style.setProperty('overflow', originalStyle.overflow);
      };
    }
  }, [show, type]);

  const handleClose = () => {
    setShow(false);
    hideNotification();
  };

  const handleButtonClick = (onClick: () => void) => {
    onClick();
    handleClose();
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
          {additionalButtons && additionalButtons.map((button: AdditionalButton, index: number) => (
            <Button
              key={index}
              variant={button.variant || 'primary'}
              onClick={() => handleButtonClick(button.onClick)}
            >
              {button.label}
            </Button>
          ))}
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