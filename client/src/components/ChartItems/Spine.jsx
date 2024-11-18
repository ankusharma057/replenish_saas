
// import { useRef, useState } from 'react';
// import { ReactSketchCanvas } from 'react-sketch-canvas';
// import { Button } from 'react-bootstrap';
// import { Eraser, Pen, Redo, RotateCcw, Save, Undo } from 'lucide-react';

// export default function Spine() {
//   const colorInputRef = useRef(null);
//   const canvasRef = useRef(null);
//   const [strokeColor, setStrokeColor] = useState('#a855f7');
//   const [eraseMode, setEraseMode] = useState(false);

//   // Path to the image file in the public folder
//   const bodyChartImage = '/shutterstock_442112374_edited.png'; // Ensure the image is in the public folder


//     const leftLabels = [
//         ...Array.from({ length: 8 }, (_, i) => `C${i}`),  // C0 to C7
//         ...Array.from({ length: 12 }, (_, i) => `T${i + 1}`),  // T1 to T12
//         ...Array.from({ length: 5 }, (_, i) => `L${i + 1}`),   // L1 to L5
//         "Sacrum", "SI AS", "SI PI", "Coccyx",  // Last four specific strings
//       ];

//       const rightLabels = [
//         ...Array.from({ length: 8 }, (_, i) => `C${i}`),  // C0 to C7
//         ...Array.from({ length: 12 }, (_, i) => `T${i + 1}`),  // T1 to T12
//         ...Array.from({ length: 5 }, (_, i) => `L${i + 1}`),   // L1 to L5
//         "Sacrum", "SI AS", "SI PI", "Coccyx",  // Last four specific strings
//       ];
      

//   // Checkbox states
//   const [leftCheckboxStates, setLeftCheckboxStates] = useState(
//     leftLabels.reduce((acc, label) => ({ ...acc, [label]: false }), {})
//   );

//   const [rightCheckboxStates, setRightCheckboxStates] = useState(
//     rightLabels.reduce((acc, label) => ({ ...acc, [label]: false }), {})
//   );

//   function handleStrokeColorChange(event) {
//     setStrokeColor(event.target.value);
//   }

//   function handleEraserClick() {
//     setEraseMode(true);
//     canvasRef.current?.eraseMode(true);
//   }

//   function handlePenClick() {
//     setEraseMode(false);
//     canvasRef.current?.eraseMode(false);
//   }

//   function handleUndoClick() {
//     canvasRef.current?.undo();
//   }

//   function handleRedoClick() {
//     canvasRef.current?.redo();
//   }

//   function handleClearClick() {
//     canvasRef.current?.clearCanvas();
//   }

//   async function handleSave() {
//     const dataURL = await canvasRef.current?.exportImage('png');
//     if (dataURL) {
//       const link = Object.assign(document.createElement('a'), {
//         href: dataURL,
//         style: { display: 'none' },
//         download: 'sketch.png',
//       });

//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//     }
//   }

//   // Handle checkbox change
//   function handleLeftCheckboxChange(label) {
//     setLeftCheckboxStates(prevState => ({
//       ...prevState,
//       [label]: !prevState[label]
//     }));
//   }

//   function handleRightCheckboxChange(label) {
//     setRightCheckboxStates(prevState => ({
//       ...prevState,
//       [label]: !prevState[label]
//     }));
//   }

//   return (
//     <div className="mt-6 flex max-w-2xl gap-4 relative">
//       {/* Canvas */}
//       <ReactSketchCanvas
//         width="100%"
//         height="900px"  // Increased height to stretch the image more
//         ref={canvasRef}
//         strokeColor={strokeColor}
//         canvasColor="transparent"
//         backgroundImage={bodyChartImage} // Set image as background
//         className="!rounded-2xl !border-purple-500 dark:!border-purple-800"
//       />

//       {/* Left Side Checkboxes */}
//       <div
//         className="absolute top-0 flex flex-col gap-1 p-2"  // Reduced padding to bring closer
//         style={{
//           height: '700px', // Increased height to match the canvas
//           width: '50%', // 50% of the canvas width
//           fontSize: '0.9rem', // Slightly increased font size for the checkboxes
//           left: '100px',
//         }}
//       >
//         <span className="block font-bold text-xl text-purple-700 mb-4">Left</span>
//         {leftLabels.slice(0, 29).map(label => (
//           <label key={label} className="flex items-center">
//             <input
//               type="checkbox"
//               checked={leftCheckboxStates[label]}
//               onChange={() => handleLeftCheckboxChange(label)}
//               style={{ transform: 'scale(0.9)' }} // Increased checkbox size slightly
//             />
//             <span>{label}</span>
//           </label>
//         ))}
//       </div>

//       {/* Right Side Checkboxes */}
//       <div
//         className="absolute top-0 flex flex-col gap-1 p-2"  // Reduced padding to bring closer
//         style={{
//           height: '700px', // Increased height to match the canvas
//           width: '50%', // 50% of the canvas width
//           fontSize: '0.9rem', // Slightly increased font size for the checkboxes
//           right: '0px',
//           transform: 'translateX(100px)', // Move the checkboxes to the right by 20px
//         }}
//       >
//         <span className="block font-bold text-xl text-purple-700 mb-4">Right</span>
//         {rightLabels.slice(0, 29).map(label => (
//           <label key={label} className="flex items-center">
//             <input
//               type="checkbox"
//               checked={rightCheckboxStates[label]}
//               onChange={() => handleRightCheckboxChange(label)}
//               style={{ transform: 'scale(0.9)' }} // Increased checkbox size slightly
//             />
//             <span>{label}</span>
//           </label>
//         ))}
//       </div>

//       {/* Controls */}
//       <div className="flex flex-col items-center gap-y-6 divide-y divide-purple-200 py-4 dark:divide-purple-900">
//         {/* Color picker */}
//         <Button
//           size="icon"
//           type="button"
//           onClick={() => colorInputRef.current?.click()}
//           style={{ backgroundColor: strokeColor }}
//         >
//           <input
//             type="color"
//             ref={colorInputRef}
//             className="sr-only"
//             value={strokeColor}
//             onChange={handleStrokeColorChange}
//           />
//         </Button>

//         {/* Drawing mode */}
//          <div className="flex flex-col gap-3 pt-6">
//            <Button
//             size="icon"
//             type="button"
//             variant="outline"
//             disabled={!eraseMode}
//             onClick={handlePenClick}
//           >
//             <Pen size={16} />
//           </Button>
//           <Button
//             size="icon"
//             type="button"
//             variant="outline"
//             disabled={eraseMode}
//             onClick={handleEraserClick}
//           >
//             <Eraser size={16} />
//           </Button>
//         </div>

// //         {/* Actions */}
//          <div className="flex flex-col gap-3 pt-6">
//            <Button size="icon" type="button" variant="outline" onClick={handleUndoClick}>
//              <Undo size={16} />
//            </Button>
//            <Button size="icon" type="button" variant="outline" onClick={handleRedoClick}>
//              <Redo size={16} />
//            </Button>
//            <Button size="icon" type="button" variant="outline" onClick={handleClearClick}>
//              <RotateCcw size={16} />
//            </Button>

//            <Button size="icon" type="button" variant="outline" onClick={handleSave}>
//              <Save size={16} />
//            </Button>
//          </div>
//        </div>
//      </div>
//    ); 
//  }

import { useRef, useState, useEffect } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import { Button } from 'react-bootstrap';
import { Eraser, Pen, Redo, RotateCcw, Save, Undo } from 'lucide-react';


const Spine = ({ imageSrc }) =>  {
  const colorInputRef = useRef(null);
  const canvasRef = useRef(null);
  const [strokeColor, setStrokeColor] = useState('#a855f7');
  const [eraseMode, setEraseMode] = useState(false);
  const [notes, setNotes] = useState('');

  // Path to the image file in the public folder
  // const spineImage = '/shutterstock_442112374_edited.png'; // Ensure the image is in the public folder
  const [spineImage, setSpineImage] = useState(null); // State for BodyChart image
  // const canvasRef = useRef(null);

  // useEffect(() => {
  //     // Example: Set the background image when the component mounts
  //     setSpineImage('/shutterstock_442112374_edited.png');
  // }, []); // Ensure this effect runs only once on mount
  
  useEffect(() => {
    // Ensure each Spine component has its own image, passed via props
    if (imageSrc) {
      setSpineImage(imageSrc);
    }
  }, [imageSrc]);


  const leftLabels = [
    ...Array.from({ length: 8 }, (_, i) => `C${i}`),  // C0 to C7
    ...Array.from({ length: 12 }, (_, i) => `T${i + 1}`),  // T1 to T12
    ...Array.from({ length: 5 }, (_, i) => `L${i + 1}`),   // L1 to L5
    "Sacrum", "SI AS", "SI PI", "Coccyx",  // Last four specific strings
  ];

  const rightLabels = [
    ...Array.from({ length: 8 }, (_, i) => `C${i}`),  // C0 to C7
    ...Array.from({ length: 12 }, (_, i) => `T${i + 1}`),  // T1 to T12
    ...Array.from({ length: 5 }, (_, i) => `L${i + 1}`),   // L1 to L5
    "Sacrum", "SI AS", "SI PI", "Coccyx",  // Last four specific strings
  ];

  // Checkbox states
  const [leftCheckboxStates, setLeftCheckboxStates] = useState(
    leftLabels.reduce((acc, label) => ({ ...acc, [label]: false }), {})
  );

  const [rightCheckboxStates, setRightCheckboxStates] = useState(
    rightLabels.reduce((acc, label) => ({ ...acc, [label]: false }), {})
  );

  function handleStrokeColorChange(event) {
    setStrokeColor(event.target.value);
  }

  function handleEraserClick() {
    setEraseMode(true);
    canvasRef.current?.eraseMode(true);
  }

  function handlePenClick() {
    setEraseMode(false);
    canvasRef.current?.eraseMode(false);
  }

  function handleUndoClick() {
    canvasRef.current?.undo();
  }

  function handleRedoClick() {
    canvasRef.current?.redo();
  }

  function handleClearClick() {
    canvasRef.current?.clearCanvas();
  }

  async function handleSave() {
    const dataURL = await canvasRef.current?.exportImage('png');
    if (dataURL) {
      const link = Object.assign(document.createElement('a'), {
        href: dataURL,
        style: { display: 'none' },
        download: 'sketch.png',
      });

      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  }

  function handleLeftCheckboxChange(label) {
    setLeftCheckboxStates(prevState => ({
      ...prevState,
      [label]: !prevState[label]
    }));
  }

  function handleRightCheckboxChange(label) {
    setRightCheckboxStates(prevState => ({
      ...prevState,
      [label]: !prevState[label]
    }));
  }

  function handleNotesChange(event) {
    setNotes(event.target.value);
  }

  return (
    <div>
    <div className="mt-6 flex max-w-2xl gap-4 relative">
      {/* Canvas */}
      <ReactSketchCanvas
        width="100%"
        height="900px"  
        ref={canvasRef}
        strokeColor={strokeColor}
        canvasColor="transparent"
        backgroundImage={spineImage} 
        className="!rounded-2xl !border-purple-500 dark:!border-purple-800"
      />

      {/* Left Side Checkboxes */}
      <div
        className="absolute top-0 flex flex-col gap-1 p-2"
        style={{
          height: '700px',
          width: '50%',
          fontSize: '0.9rem',
          left: '100px',
        }}
      >
        <span className="block font-bold text-xl text-purple-700 mb-4">Left</span>
        {leftLabels.slice(0, 29).map(label => (
          <label key={label} className="flex items-center">
            <input
              type="checkbox"
              checked={leftCheckboxStates[label]}
              onChange={() => handleLeftCheckboxChange(label)}
              style={{ transform: 'scale(0.9)' }} 
            />
            <span>{label}</span>
          </label>
        ))}
      </div>

      {/* Right Side Checkboxes */}
      <div
        className="absolute top-0 flex flex-col gap-1 p-2"
        style={{
          height: '700px',
          width: '50%',
          fontSize: '0.9rem',
          right: '0px',
          transform: 'translateX(100px)',
        }}
      >
        <span className="block font-bold text-xl text-purple-700 mb-4">Right</span>
        {rightLabels.slice(0, 29).map(label => (
          <label key={label} className="flex items-center">
            <input
              type="checkbox"
              checked={rightCheckboxStates[label]}
              onChange={() => handleRightCheckboxChange(label)}
              style={{ transform: 'scale(0.9)' }} 
            />
            <span>{label}</span>
          </label>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-y-6 divide-y divide-purple-200 py-4 dark:divide-purple-900">
        {/* Color picker */}
        <Button
          size="icon"
          type="button"
          onClick={() => colorInputRef.current?.click()}
          style={{ backgroundColor: strokeColor }}
        >
          <input
            type="color"
            ref={colorInputRef}
            className="sr-only"
            value={strokeColor}
            onChange={handleStrokeColorChange}
          />
        </Button>

        {/* Drawing mode */}
        <div className="flex flex-col gap-3 pt-6">
          <Button
            size="icon"
            type="button"
            variant="outline"
            disabled={!eraseMode}
            onClick={handlePenClick}
          >
            <Pen size={16} />
          </Button>
          <Button
            size="icon"
            type="button"
            variant="outline"
            disabled={eraseMode}
            onClick={handleEraserClick}
          >
            <Eraser size={16} />
          </Button>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-6">
          <Button size="icon" type="button" variant="outline" onClick={handleUndoClick}>
            <Undo size={16} />
          </Button>
          <Button size="icon" type="button" variant="outline" onClick={handleRedoClick}>
            <Redo size={16} />
          </Button>
          <Button size="icon" type="button" variant="outline" onClick={handleClearClick}>
            <RotateCcw size={16} />
          </Button>

          <Button size="icon" type="button" variant="outline" onClick={handleSave}>
            <Save size={16} />
          </Button>
        </div>
      </div>
      
    {/* Spine Notes Section */}
    {/* <div className="mt-6 px-6">
      <span className="block font-bold text-xl text-purple-700 mb-2">Spine Notes</span>
      <textarea
        value={notes}
        onChange={handleNotesChange}
        placeholder="Enter your notes here..."
        className="w-full p-2 border border-purple-500 rounded-lg"
        rows="4"
      />
    </div> */}
    </div>
    <div className="mt-6 px-6">
      <span className="block font-bold text-xl text-purple-700 mb-2">Spine Notes</span>
      <textarea
        value={notes}
        onChange={handleNotesChange}
        placeholder="Enter your notes here..."
        className="w-full p-2 border border-purple-500 rounded-lg"
        rows="4"
      />
    </div>
        </div>
  );
}

export default Spine;