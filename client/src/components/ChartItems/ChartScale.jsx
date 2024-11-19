import React, { useState } from 'react';

const ChartScale = () => {
    const [heading, setHeading] = useState('Scale');
    const [points, setPoints] = useState([{ label: '0', value: 0 }, { label: '1', value: 1 }, { label: '2', value: 2 }, { label: '3', value: 3 }, { label: '4', value: 4 }]);
    const [numPoints, setNumPoints] = useState(5);
    const [selectedPoint, setSelectedPoint] = useState(null); // To track where the circle is placed
    const [isModalOpen, setIsModalOpen] = useState(false);

    const toggleModal = () => setIsModalOpen(!isModalOpen);

    const handleHeadingChange = (event) => {
        setHeading(event.target.value);
    };

    const handlePointChange = (index, field, value) => {
        const newPoints = [...points];
        newPoints[index][field] = value;
        setPoints(newPoints);
    };

    const handleNumPointsChange = (increment) => {
        if (increment) {
            setNumPoints(prev => prev + 1);
            setPoints(prev => [...prev, { label: '', value: prev.length }]);
        } else {
            setNumPoints(prev => prev > 0 ? prev - 1 : 0);
            setPoints(prev => prev.slice(0, -1));
        }
    };

    const handleScaleClick = (event) => {
        const scaleWidth = event.target.offsetWidth;
        const clickPosition = event.nativeEvent.offsetX;
        const scaleValue = Math.round((clickPosition / scaleWidth) * (numPoints - 1)); // Adjust to number of points
        setSelectedPoint(scaleValue);
    };

    return (
        <div style={containerStyles}>
            <h3 onClick={toggleModal} style={headingStyles}>{heading}</h3>

            <div style={scaleContainerStyles} onClick={handleScaleClick}>
                <div style={scaleStyles}>
                    {points.map((point, index) => {
                        // Calculate the left position based on the index to evenly distribute points
                        const position = (index / (numPoints - 1)) * 100;
                        return (
                            <div
                                key={index}
                                style={{
                                    ...markerStyles,
                                    left: `${position}%`, // Position based on index
                                }}
                            >
                                <span style={markerLabelStyles}>{point.label}</span>
                            </div>
                        );
                    })}
                    {selectedPoint !== null && (
                        <div style={{
                            ...selectedMarkerStyles,
                            left: `${(selectedPoint / (numPoints - 1)) * 100}%`
                        }} />
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div style={modalStyles}>
                    <div style={modalContentStyles}>
                        <h4>Edit Scale Options</h4>

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
                            <h5>Scale Points</h5>
                            {points.map((point, index) => (
                                <div key={index} style={formGroupStyles}>
                                    <label>Point {index + 1} Label: </label>
                                    <input
                                        type="text"
                                        value={point.label}
                                        onChange={(e) => handlePointChange(index, 'label', e.target.value)}
                                        style={inputStyles}
                                    />
                                    <label>Value: </label>
                                    <input
                                        type="number"
                                        value={point.value}
                                        onChange={(e) => handlePointChange(index, 'value', e.target.value)}
                                        style={inputStyles}
                                    />
                                </div>
                            ))}
                        </div>

                        <div style={buttonGroupStyles}>
                            <button onClick={() => handleNumPointsChange(true)} style={buttonStyles}>Add Point</button>
                            <button onClick={() => handleNumPointsChange(false)} style={buttonStyles}>Remove Point</button>
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

const scaleContainerStyles = {
    position: 'relative',
    height: '50px',
    width: '100%',
    backgroundColor: '#ddd',
    borderRadius: '5px',
    marginBottom: '20px',
    cursor: 'pointer',
};

const scaleStyles = {
    position: 'relative',
    width: '100%',
    height: '100%',
};

const markerStyles = {
    position: 'absolute',
    bottom: '0',
    width: '15px',
    height: '25px',
    backgroundColor: '#3498db',
    borderRadius: '50%',
    transform: 'translateX(-50%)', // Center the marker
};

const markerLabelStyles = {
    position: 'absolute',
    top: '-25px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '12px',
    color: '#333',
};

const selectedMarkerStyles = {
    position: 'absolute',
    bottom: '0',
    width: '20px',
    height: '30px',
    backgroundColor: '#e74c3c',
    borderRadius: '50%',
    transform: 'translateX(-50%)',
    zIndex: 2,
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
    maxHeight: '80vh', // Max height of the modal
    overflowY: 'auto', // Scroll if content exceeds max height
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

export default ChartScale;
