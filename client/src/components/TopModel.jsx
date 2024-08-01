import React, { useRef, useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import Modal from 'react-modal';


const customStyles = {
  content: {
    top: '16%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

Modal.setAppElement('#root');

export const TopModel = forwardRef(({ children, footer }, ref) => {
  const subtitle = useRef(null);
  const [modalIsOpen, setIsOpen] = useState(false);

  const openModal = () => {
    setIsOpen(!modalIsOpen);
  };

  const closeModal = () => {
    setIsOpen(false)
  };

  const afterOpenModal = () => {
    if (subtitle.current) {
      subtitle.current.style.color = '#f00';
    }
  };

  useImperativeHandle(ref, () => ((modalIsOpen)?{closeModal}:{openModal}));

  return (
    <div >
      <Modal
        isOpen={modalIsOpen}
        onAfterOpen={afterOpenModal}
        style={customStyles}
        contentLabel="Example Modal"
      >
        <div className='top-model-children'>
          {children}
        </div>
        {footer}
      </Modal>
    </div>
  );
});

