import React, { useState } from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { FaInfoCircle } from 'react-icons/fa';
import './InfoPopover.css';

interface InfoPopoverProps {
  content: React.ReactNode;
}

const InfoPopover: React.FC<InfoPopoverProps> = ({ content }) => {
  const [show, setShow] = useState(false);

  const popover = (
    <Popover id="info-popover">
      <Popover.Body>{content}</Popover.Body>
    </Popover>
  );

  return (
    <OverlayTrigger
      trigger="click"
      placement="top"
      overlay={popover}
      show={show}
      onToggle={(nextShow) => setShow(nextShow)}
    >
      <span 
        role="button"
        tabIndex={0}
        style={{ cursor: 'pointer' }}
        className="info-popover-trigger"
      >
        {' '}
        <FaInfoCircle 
          className={`text-primary transition-all duration-300 ${show ? 'text-blue-600 scale-110' : 'text-blue-500 scale-100'}`} 
          style={{ display: 'inline', verticalAlign: 'text-top' }}
        />
      </span>
    </OverlayTrigger>
  );
};

export default InfoPopover;