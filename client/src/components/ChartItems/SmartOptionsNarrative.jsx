import React, { useState } from 'react';

const SmartOptionsNarrative = () => {
    const [heading, setHeading] = useState('Smart Options Narrative');
    const [subjects, setSubjects] = useState([
        { name: 'Subject 1', options: ['worse', 'the same', 'better'], selectedOptions: [] },
        { name: 'Subject 2', options: ['worse', 'the same', 'better'], selectedOptions: [] },
        { name: 'Subject 3', options: ['worse', 'the same', 'better'], selectedOptions: [] },
    ]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSubjectIndex, setSelectedSubjectIndex] = useState(null);

    const toggleModal = () => setIsModalOpen(!isModalOpen);

    // Handle changes to the heading
    const handleHeadingChange = (event) => {
        setHeading(event.target.value);
    };

    // Handle subject name changes
    const handleSubjectChange = (index, event) => {
        const newSubjects = [...subjects];
        newSubjects[index].name = event.target.value;
        setSubjects(newSubjects);
    };

    // Handle option name changes
    const handleOptionChange = (subjectIndex, optionIndex, event) => {
        const newSubjects = [...subjects];
        newSubjects[subjectIndex].options[optionIndex] = event.target.value;
        setSubjects(newSubjects);
    };

    // Handle adding/removing options for all subjects
    const handleOptionCountChange = (increment) => {
        const newSubjects = subjects.map(subject => {
            let newOptions = [...subject.options];
            if (increment) {
                newOptions.push('');
            } else {
                newOptions.pop();
            }
            return { ...subject, options: newOptions };
        });
        setSubjects(newSubjects);
    };

    // Handle adding/removing subjects
    const handleSubjectCountChange = (increment) => {
        if (increment) {
            setSubjects([
                ...subjects,
                { name: `Subject ${subjects.length + 1}`, options: Array(subjects[0].options.length).fill(''), selectedOptions: [] }
            ]);
        } else {
            setSubjects(subjects.slice(0, -1));
        }
    };

    // Handle selection/deselection of options
    const handleOptionSelection = (subjectIndex, option) => {
        const newSubjects = [...subjects];
        const selectedOptions = newSubjects[subjectIndex].selectedOptions;
        const isSelected = selectedOptions.includes(option);

        if (isSelected) {
            // Deselect the option
            newSubjects[subjectIndex].selectedOptions = selectedOptions.filter(selectedOption => selectedOption !== option);
        } else {
            // Select the option
            newSubjects[subjectIndex].selectedOptions.push(option);
        }

        setSubjects(newSubjects);
    };

    // Open modal for subject editing
    const openModalForSubject = (index) => {
        setSelectedSubjectIndex(index);
        toggleModal();
    };

    return (
        <div style={containerStyles}>
            <h3 style={headingStyles} onClick={toggleModal}>
                {heading}
            </h3>

            <div style={subjectsContainerStyles}>
                {subjects.map((subject, subjectIndex) => (
                    <div key={subjectIndex} style={subjectCardStyles}>
                        <div style={subjectHeaderStyles}>
                            <span>{subject.name}</span>
                        </div>

                        <div style={optionsContainerStyles}>
                            {subject.options.map((option, optionIndex) => (
                                <div 
                                    key={optionIndex} 
                                    style={{
                                        ...optionStyles,
                                        backgroundColor: subject.selectedOptions.includes(option) ? '#2980b9' : '#ecf0f1', // Darker color for selected
                                    }}
                                    onClick={() => handleOptionSelection(subjectIndex, option)} // Handle option click
                                >
                                    <span>{option}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal for Editing Subject and Options */}
            {isModalOpen && selectedSubjectIndex !== null && (
                <div style={modalStyles}>
                    <div style={modalContentStyles}>
                        <h4>Edit Smart Options Narrative</h4>

                        {/* Edit Heading */}
                        <div style={formGroupStyles}>
                            <label>Edit Heading:</label>
                            <input
                                type="text"
                                value={heading}
                                onChange={handleHeadingChange}
                                style={inputStyles}
                            />
                        </div>

                        {/* Edit Subjects and Options */}
                        <h5>Subjects</h5>
                        <div style={optionsEditContainerStyles}>
                            {subjects.map((subject, subjectIndex) => (
                                <div key={subjectIndex} style={subjectEditStyles}>
                                    <label>Subject {subjectIndex + 1} Name:</label>
                                    <input
                                        type="text"
                                        value={subject.name}
                                        onChange={(e) => handleSubjectChange(subjectIndex, e)}
                                        style={inputStyles}
                                    />

                                    <h6>Options</h6>
                                    {subject.options.map((option, optionIndex) => (
                                        <div key={optionIndex} style={optionEditStyles}>
                                            <input
                                                type="text"
                                                value={option}
                                                onChange={(e) => handleOptionChange(subjectIndex, optionIndex, e)}
                                                style={inputStyles}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>

                        <div style={buttonGroupStyles}>
                            <button onClick={() => handleSubjectCountChange(true)} style={buttonStyles}>Add Subject</button>
                            <button onClick={() => handleSubjectCountChange(false)} style={buttonStyles}>Remove Subject</button>

                            <button onClick={() => handleOptionCountChange(true)} style={buttonStyles}>Add Option</button>
                            <button onClick={() => handleOptionCountChange(false)} style={buttonStyles}>Remove Option</button>
                        </div>

                        <button onClick={toggleModal} style={modalCloseButtonStyles}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Styles
const containerStyles = {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    maxWidth: '600px',
    margin: 'auto',
};

const headingStyles = {
    textAlign: 'center',
    fontSize: '20px',
    marginBottom: '20px',
    cursor: 'pointer',
};

const inputStyles = {
    padding: '10px',
    width: '100%',
    fontSize: '14px',
    borderRadius: '4px',
    border: '1px solid #ddd',
};

const subjectsContainerStyles = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: '20px',
};

const subjectCardStyles = {
    backgroundColor: '#fff',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    marginBottom: '15px',
    width: '30%',
    cursor: 'pointer',
    boxSizing: 'border-box',
};

const subjectHeaderStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
};

const optionsContainerStyles = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
};

const optionStyles = {
    display: 'flex',
    alignItems: 'center',
    marginRight: '15px',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
};

const buttonGroupStyles = {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '10px',
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
    maxWidth: '500px',
    width: '100%',
    maxHeight: '80vh', // This makes the modal container scrollable
    overflowY: 'auto', // Enables scrolling when content exceeds maxHeight
};

const formGroupStyles = {
    marginBottom: '15px',
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

const optionsEditContainerStyles = {
    marginBottom: '20px',
};

const subjectEditStyles = {
    marginBottom: '20px',
};

const optionEditStyles = {
    marginBottom: '10px',
};

export default SmartOptionsNarrative;
