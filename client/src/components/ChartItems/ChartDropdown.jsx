import React, { useState } from 'react';

const ChartDropdown = () => {
    const [heading, setHeading] = useState('Dropdown');
    const [options, setOptions] = useState(['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5']);
    const [numOptions, setNumOptions] = useState(5);
    const [selectedOption, setSelectedOption] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const toggleModal = () => setIsModalOpen(!isModalOpen);

    const handleHeadingChange = (event) => {
        setHeading(event.target.value);
    };

    const handleOptionChange = (index, event) => {
        const newOptions = [...options];
        newOptions[index] = event.target.value;
        setOptions(newOptions);
    };

    const handleNumOptionsChange = (increment) => {
        if (increment) {
            setNumOptions(prev => prev + 1);
            setOptions(prev => [...prev, '']);
        } else {
            setNumOptions(prev => prev > 0 ? prev - 1 : 0);
            setOptions(prev => prev.slice(0, -1));
        }
    };

    const handleSelectChange = (event) => {
        setSelectedOption(event.target.value);
    };

    return (
        <div style={containerStyles}>
            <h3 onClick={toggleModal} style={headingStyles}>{heading}</h3>

            <div>
                {/* Dropdown */}
                <select
                    value={selectedOption}
                    onChange={handleSelectChange}
                    style={dropdownStyles}
                >
                    <option value="">Select an option</option>
                    {options.map((option, index) => (
                        <option key={index} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            </div>

            {isModalOpen && (
                <div style={modalStyles}>
                    <div style={modalContentStyles}>
                        <h4>Edit Dropdown Options</h4>

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
                            <h5>Dropdown Options</h5>
                            {Array.from({ length: numOptions }, (_, index) => (
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
                            <button onClick={() => handleNumOptionsChange(true)} style={buttonStyles}>Add Option</button>
                            <button onClick={() => handleNumOptionsChange(false)} style={buttonStyles}>Remove Option</button>
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

const dropdownStyles = {
    padding: '10px',
    fontSize: '16px',
    width: '100%',
    borderRadius: '4px',
    border: '1px solid #ddd',
    marginTop: '10px',
    marginBottom: '20px',
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

export default ChartDropdown;
