import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react';
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
    <div>
      <Modal
        isOpen={modalIsOpen}
        onAfterOpen={afterOpenModal}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Example Modal"
      >
        {children}
        {footer}
      </Modal>
    </div>
  );
});

{/* <div className='flex justify-end gap-2'>
          <button type='button' className='bg-[#0dcaf0] px-2 py-[3px] text-[15px] rounded-md text-white' onClick={closeModal}>Close</button>
          <button type='button' className='bg-[#0dcaf0] px-2 py-[3px] text-[15px] rounded-md text-white' onClick={onSave}>Save</button>
        </div> */}