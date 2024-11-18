import React, { useState } from 'react';

const Checkboxes = () => {
    const [heading, setHeading] = useState('Check boxes');
    const [options, setOptions] = useState(['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5']);
    const [numCheckboxes, setNumCheckboxes] = useState(5);
    const [notes, setNotes] = useState(['', '', '', '', '']);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isNotesEnabled, setIsNotesEnabled] = useState(true); 

    const toggleModal = () => setIsModalOpen(!isModalOpen);

    const handleHeadingChange = (event) => {
        setHeading(event.target.value);
    };

    const handleOptionChange = (index, event) => {
        const newOptions = [...options];
        newOptions[index] = event.target.value;
        setOptions(newOptions);
    };

    const handleNoteChange = (index, event) => {
        const newNotes = [...notes];
        newNotes[index] = event.target.value;
        setNotes(newNotes);
    };

    const handleNumCheckboxesChange = (increment) => {
        if (increment) {
            setNumCheckboxes(prev => prev + 1);
            setOptions(prev => [...prev, '']);
            setNotes(prev => [...prev, '']);
        } else {
            setNumCheckboxes(prev => prev > 0 ? prev - 1 : 0);
            setOptions(prev => prev.slice(0, -1));
            setNotes(prev => prev.slice(0, -1));
        }
    };

    return (
        <div style={containerStyles}>
            <h3 onClick={toggleModal} style={headingStyles}>{heading}</h3>

            <div>
                {Array.from({ length: numCheckboxes }, (_, index) => (
                    <div key={index} style={checkboxContainerStyles}>
                        <input type="checkbox" id={`checkbox-${index}`} />
                        <label htmlFor={`checkbox-${index}`} style={labelStyles}>{options[index]}</label>
                        
                        {isNotesEnabled && (
                            <input
                                type="text"
                                placeholder="Note"
                                value={notes[index]}
                                onChange={(e) => handleNoteChange(index, e)}
                                style={noteInputStyles}
                            />
                        )}
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div style={modalStyles}>
                    <div style={modalContentStyles}>
                        <h4>Edit Options</h4>

                        <div style={formGroupStyles}>
                            <label>Edit Heading: </label>
                            <input
                                type="text"
                                value={heading}
                                onChange={handleHeadingChange}
                                style={inputStyles}
                            />
                        </div>

                        <div>
                            <h5>Checkbox Options</h5>
                            {Array.from({ length: numCheckboxes }, (_, index) => (
                                <div key={index} style={formGroupStyles}>
                                    <label>Option {index + 1}: </label>
                                    <input
                                        type="text"
                                        value={options[index]}
                                        onChange={(e) => handleOptionChange(index, e)}
                                        style={inputStyles}
                                    />
                                </div>
                            ))}
                        </div>

                        <div style={buttonGroupStyles}>
                            <button onClick={() => handleNumCheckboxesChange(true)} style={buttonStyles}>Add Checkbox</button>
                            <button onClick={() => handleNumCheckboxesChange(false)} style={buttonStyles}>Remove Checkbox</button>
                        </div>

                        <div style={formGroupStyles}>
                            <label>Enable Notes</label>
                            <input
                                type="checkbox"
                                checked={isNotesEnabled}
                                onChange={() => setIsNotesEnabled(!isNotesEnabled)}
                                style={checkboxStyle}
                            />
                        </div>

                        <button onClick={toggleModal} style={modalCloseButtonStyles}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

const containerStyles = {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    maxWidth: '500px',
    margin: 'auto',
};

const headingStyles = {
    cursor: 'pointer',
    color: '#2c3e50',
    textAlign: 'center',
    fontSize: '20px',
    marginBottom: '20px',
    transition: 'color 0.3s ease',
};

const headingHoverStyles = {
    color: '#e74c3c',
};

const checkboxContainerStyles = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px',
};

const labelStyles = {
    marginLeft: '10px',
    fontSize: '16px',
    flex: 1,
};

const noteInputStyles = {
    marginLeft: '10px',
    padding: '5px',
    fontSize: '14px',
    width: '150px',
};

const modalStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
};

const modalContentStyles = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '5px',
    maxWidth: '400px',
    width: '100%',
};

const formGroupStyles = {
    marginBottom: '15px',
};

const inputStyles = {
    padding: '10px',
    width: '100%',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px',
};

const buttonGroupStyles = {
    marginBottom: '15px',
    textAlign: 'center',
};

const buttonStyles = {
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
    padding: '8px 15px',
    fontSize: '14px',
    borderRadius: '4px',
    cursor: 'pointer',
    margin: '5px',
};

const modalCloseButtonStyles = {
    backgroundColor: '#e74c3c',
    color: '#fff',
    border: 'none',
    padding: '10px 15px',
    fontSize: '16px',
    borderRadius: '4px',
    cursor: 'pointer',
    width: '100%',
    marginTop: '10px',
};

const checkboxStyle = {
    marginLeft: '10px',
};

export default Checkboxes;
