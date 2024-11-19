// import React, { useState } from 'react';

// const OpticalMeasurements = () => {
//     const [title, setTitle] = useState('Optical Measurements');
//     const [measurements, setMeasurements] = useState({
//         OD: { sphere: '', cyl: '', axis: '', add: '', horizontalPrism: '', verticalPrism: '', visualAcuity: '20/' },
//         OS: { sphere: '', cyl: '', axis: '', add: '', horizontalPrism: '', verticalPrism: '', visualAcuity: '20/' }
//     });
//     const [isModalOpen, setIsModalOpen] = useState(false);

//     // Toggle the modal for title editing
//     const toggleModal = () => setIsModalOpen(!isModalOpen);

//     // Handle title change
//     const handleTitleChange = (e) => setTitle(e.target.value);

//     // Handle input changes for the table
//     const handleInputChange = (eye, field, event) => {
//         const value = event.target.value;
//         const newMeasurements = { ...measurements };
//         newMeasurements[eye][field] = value;
//         setMeasurements(newMeasurements);
//     };

//     return (
//         <div style={containerStyles}>
//             {/* Title Section */}
//             <h3 style={headingStyles} onClick={toggleModal}>
//                 {title}
//             </h3>

//             {/* Optical Measurements Table */}
//             <table style={tableStyles}>
//                 <thead>
//                     <tr>
//                         <th>Sphere</th>
//                         <th>Cyl</th>
//                         <th>Axis</th>
//                         <th>Add</th>
//                         <th>Horizontal Prism</th>
//                         <th>Vertical Prism</th>
//                         <th>Visual Acuity</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {['OD', 'OS'].map((eye) => (
//                         <tr key={eye}>
//                             <td><input type="text" value={measurements[eye].sphere} onChange={(e) => handleInputChange(eye, 'sphere', e)} style={inputStyles} /></td>
//                             <td><input type="text" value={measurements[eye].cyl} onChange={(e) => handleInputChange(eye, 'cyl', e)} style={inputStyles} /></td>
//                             <td><input type="text" value={measurements[eye].axis} onChange={(e) => handleInputChange(eye, 'axis', e)} style={inputStyles} /></td>
//                             <td><input type="text" value={measurements[eye].add} onChange={(e) => handleInputChange(eye, 'add', e)} style={inputStyles} /></td>
//                             <td><input type="text" value={measurements[eye].horizontalPrism} onChange={(e) => handleInputChange(eye, 'horizontalPrism', e)} style={inputStyles} /></td>
//                             <td><input type="text" value={measurements[eye].verticalPrism} onChange={(e) => handleInputChange(eye, 'verticalPrism', e)} style={inputStyles} /></td>
//                             <td>
//                                 <input
//                                     type="text"
//                                     value={measurements[eye].visualAcuity}
//                                     onChange={(e) => handleInputChange(eye, 'visualAcuity', e)}
//                                     style={inputStyles}
//                                     maxLength="5" // Limit input to '20/' and a number
//                                 />
//                             </td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>

//             {/* Modal for Editing Title */}
//             {isModalOpen && (
//                 <div style={modalStyles}>
//                     <div style={modalContentStyles}>
//                         <h4>Edit Title</h4>
//                         <div style={formGroupStyles}>
//                             <label>Edit Title:</label>
//                             <input
//                                 type="text"
//                                 value={title}
//                                 onChange={handleTitleChange}
//                                 style={inputStyles}
//                             />
//                         </div>
//                         <button onClick={toggleModal} style={modalCloseButtonStyles}>Close</button>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// // Styles
// const containerStyles = {
//     padding: '20px',
//     fontFamily: 'Arial, sans-serif',
//     backgroundColor: '#f9f9f9',
//     borderRadius: '8px',
//     boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
//     maxWidth: '800px',
//     margin: 'auto',
// };

// const headingStyles = {
//     textAlign: 'center',
//     fontSize: '24px',
//     marginBottom: '20px',
//     cursor: 'pointer',
// };

// const inputStyles = {
//     padding: '8px',
//     width: '100%',
//     fontSize: '14px',
//     borderRadius: '4px',
//     border: '1px solid #ddd',
//     textAlign: 'center',
// };

// const tableStyles = {
//     width: '100%',
//     borderCollapse: 'collapse',
//     marginBottom: '20px',
// };

// const modalStyles = {
//     position: 'fixed',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     display: 'flex',
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 1000,
// };

// const modalContentStyles = {
//     backgroundColor: 'white',
//     padding: '20px',
//     borderRadius: '5px',
//     maxWidth: '400px',
//     width: '100%',
// };

// const formGroupStyles = {
//     marginBottom: '15px',
// };

// const modalCloseButtonStyles = {
//     backgroundColor: '#e74c3c',
//     color: '#fff',
//     border: 'none',
//     padding: '10px 15px',
//     fontSize: '16px',
//     borderRadius: '4px',
//     cursor: 'pointer',
//     width: '100%',
//     marginTop: '10px',
// };

// export default OpticalMeasurements;

import React, { useState } from 'react';

const OpticalMeasurements = () => {
    const [title, setTitle] = useState('Optical Measurements');
    const [measurements, setMeasurements] = useState({
        OD: { sphere: '', cyl: '', axis: '', add: '', horizontalPrism: '', verticalPrism: '', visualAcuity: '20/' },
        OS: { sphere: '', cyl: '', axis: '', add: '', horizontalPrism: '', verticalPrism: '', visualAcuity: '20/' }
    });
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Toggle the modal for title editing
    const toggleModal = () => setIsModalOpen(!isModalOpen);

    // Handle title change
    const handleTitleChange = (e) => setTitle(e.target.value);

    // Handle input changes for the table
    const handleInputChange = (eye, field, event) => {
        const value = event.target.value;
        const newMeasurements = { ...measurements };
        newMeasurements[eye][field] = value;
        setMeasurements(newMeasurements);
    };

    return (
        <div style={containerStyles}>
            {/* Title Section */}
            <h3 style={headingStyles} onClick={toggleModal}>
                {title}
            </h3>

            {/* Optical Measurements Table */}
            <table style={tableStyles}>
                <thead>
                    <tr>
                        <th></th> {/* Empty cell for row headings */}
                        <th>Sphere</th>
                        <th>Cyl</th>
                        <th>Axis</th>
                        <th>Add</th>
                        <th>Horizontal Prism</th>
                        <th>Vertical Prism</th>
                        <th>Visual Acuity</th>
                    </tr>
                </thead>
                <tbody>
                    {['OD', 'OS'].map((eye) => (
                        <tr key={eye}>
                            <td style={rowLabelStyles}>{eye}</td> {/* OD/OS Row Labels */}
                            <td><input type="text" value={measurements[eye].sphere} onChange={(e) => handleInputChange(eye, 'sphere', e)} style={inputStyles} /></td>
                            <td><input type="text" value={measurements[eye].cyl} onChange={(e) => handleInputChange(eye, 'cyl', e)} style={inputStyles} /></td>
                            <td><input type="text" value={measurements[eye].axis} onChange={(e) => handleInputChange(eye, 'axis', e)} style={inputStyles} /></td>
                            <td><input type="text" value={measurements[eye].add} onChange={(e) => handleInputChange(eye, 'add', e)} style={inputStyles} /></td>
                            <td><input type="text" value={measurements[eye].horizontalPrism} onChange={(e) => handleInputChange(eye, 'horizontalPrism', e)} style={inputStyles} /></td>
                            <td><input type="text" value={measurements[eye].verticalPrism} onChange={(e) => handleInputChange(eye, 'verticalPrism', e)} style={inputStyles} /></td>
                            <td>
                                <input
                                    type="text"
                                    value={measurements[eye].visualAcuity}
                                    onChange={(e) => handleInputChange(eye, 'visualAcuity', e)}
                                    style={inputStyles}
                                    maxLength="5" // Limit input to '20/' and a number
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Modal for Editing Title */}
            {isModalOpen && (
                <div style={modalStyles}>
                    <div style={modalContentStyles}>
                        <h4>Edit Title</h4>
                        <div style={formGroupStyles}>
                            <label>Edit Title:</label>
                            <input
                                type="text"
                                value={title}
                                onChange={handleTitleChange}
                                style={inputStyles}
                            />
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
    maxWidth: '800px',
    margin: 'auto',
};

const headingStyles = {
    textAlign: 'center',
    fontSize: '24px',
    marginBottom: '20px',
    cursor: 'pointer',
};

const inputStyles = {
    padding: '8px',
    width: '100%',
    fontSize: '14px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    textAlign: 'center',
};

const rowLabelStyles = {
    fontWeight: 'bold',
    textAlign: 'center',
    padding: '10px',
};

const tableStyles = {
    width: '100%',
    borderCollapse: 'collapse',
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

export default OpticalMeasurements;
