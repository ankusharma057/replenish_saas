
// // // import { useRef, useState } from 'react';
// // // import { ReactSketchCanvas } from 'react-sketch-canvas';
// // // import { Button } from 'react-bootstrap';
// // // import { Eraser, Pen, Redo, RotateCcw, Save, Undo, Hand } from 'lucide-react'; // Hand for pointer icon

// // // export default function BodyChart() {
// // //   const colorInputRef = useRef(null);
// // //   const canvasRef = useRef(null);
// // //   const [strokeColor, setStrokeColor] = useState('#a855f7');
// // //   const [eraseMode, setEraseMode] = useState(false);
// // //   const [penMode, setPenMode] = useState(true);
// // //   const [pointerMode, setPointerMode] = useState(false); // Track pointer mode

// // //   // Path to the image file in the public folder
// // //   const bodyChartImage = '/bodyChartImage.png'; // Ensure the image is in the public folder

// // //   // State to store the pointer positions and their associated notes
// // //   const [pointers, setPointers] = useState([]);
// // //   const [notes, setNotes] = useState([]);

// // //   // Handle the click on the canvas to add a pointer
// // //   const handleCanvasClick = (event) => {
// // //     if (!pointerMode) return; // Do nothing if pointer mode is not active

// // //     const canvasRect = canvasRef.current.getCanvas().getBoundingClientRect(); // Get canvas bounding rectangle
// // //     const x = event.clientX - canvasRect.left; // Get X coordinate within canvas
// // //     const y = event.clientY - canvasRect.top;  // Get Y coordinate within canvas

// // //     // Add the new pointer position and initialize a blank note for it
// // //     setPointers((prev) => [...prev, { x, y }]);
// // //     setNotes((prev) => [...prev, '']); // Initialize a blank note for each pointer
// // //   };

// // //   // Handle changes to the notes input
// // //   const handleNoteChange = (index, event) => {
// // //     const newNotes = [...notes];
// // //     newNotes[index] = event.target.value;
// // //     setNotes(newNotes);
// // //   };

// // //   function handleStrokeColorChange(event) {
// // //     setStrokeColor(event.target.value);
// // //   }

// // //   function handleEraserClick() {
// // //     setEraseMode(true);
// // //     setPenMode(false);
// // //     setPointerMode(false); // Deactivate pointer mode if eraser is selected
// // //     canvasRef.current?.eraseMode(true);
// // //   }

// // //   function handlePenClick() {
// // //     setEraseMode(false);
// // //     setPenMode(true);
// // //     setPointerMode(false); // Deactivate pointer mode if pen is selected
// // //     canvasRef.current?.eraseMode(false);
// // //   }

// // //   function handlePointerClick() {
// // //     console.log("hand clicked");
// // //     setPointerMode(true); // Toggle pointer mode
// // //     setPenMode(false);
// // //     setEraseMode(false); // Deactivate erase mode when pointer is active
// // //   }

// // //   function handleUndoClick() {
// // //     canvasRef.current?.undo();
// // //   }

// // //   function handleRedoClick() {
// // //     canvasRef.current?.redo();
// // //   }

// // //   function handleClearClick() {
// // //     canvasRef.current?.clearCanvas();
// // //   }

// // //   async function handleSave() {
// // //     const dataURL = await canvasRef.current?.exportImage('png');
// // //     if (dataURL) {
// // //       const link = Object.assign(document.createElement('a'), {
// // //         href: dataURL,
// // //         style: { display: 'none' },
// // //         download: 'sketch.png',
// // //       });

// // //       document.body.appendChild(link);
// // //       link.click();
// // //       link.remove();
// // //     }
// // //   }

// // //   return (
// // //     <div className="mt-6 flex gap-4">
// // //       <div className="relative flex-1">
// // //         <ReactSketchCanvas
// // //           width="100%"
// // //           height="430px"
// // //           ref={canvasRef}
// // //           strokeColor={strokeColor}
// // //           canvasColor="transparent" // Transparent canvas so the image shows through
// // //           backgroundImage={bodyChartImage} // Set image as background
// // //           onClick={handleCanvasClick} // Register the click handler for pointer mode
// // //           className="!rounded-2xl !border-purple-500 dark:!border-purple-800"
// // //         />

// // //         {/* Render pointers on the canvas */}
// // //         {pointers.map((pointer, index) => (
// // //           <div
// // //             key={index}
// // //             className="absolute"
// // //             style={{
// // //               left: `${pointer.x}px`,
// // //               top: `${pointer.y}px`,
// // //               transform: 'translate(-50%, -50%)',
// // //             }}
// // //           >
// // //             {/* Pointer circle with number */}
// // //             <div className="w-6 h-6 bg-purple-500 text-white text-xs flex items-center justify-center rounded-full">
// // //               {index + 1}
// // //             </div>
// // //           </div>
// // //         ))}
// // //       </div>

// // //       {/* Toolbar on the right */}
// // //       <div className="flex flex-col items-center gap-y-6 divide-y divide-purple-200 py-4 dark:divide-purple-900 w-32">
// // //         {/* Color picker */}
// // //         <Button
// // //           size="icon"
// // //           type="button"
// // //           onClick={() => colorInputRef.current?.click()}
// // //           style={{ backgroundColor: strokeColor }}
// // //         >
// // //           <input
// // //             type="color"
// // //             ref={colorInputRef}
// // //             className="sr-only"
// // //             value={strokeColor}
// // //             onChange={handleStrokeColorChange}
// // //           />
// // //         </Button>

// // //         {/* Drawing mode */}
// // //         <div className="flex flex-col gap-3 pt-6">
// // //           <Button
// // //             size="icon"
// // //             type="button"
// // //             variant="outline"
// // //             // disabled={!eraseMode}
// // //             disabled={penMode}
// // //             onClick={handlePenClick}
// // //           >
// // //             <Pen size={16} />
// // //           </Button>
// // //           <Button
// // //             size="icon"
// // //             type="button"
// // //             variant="outline"
// // //             disabled={eraseMode}
// // //             onClick={handleEraserClick}
// // //           >
// // //             <Eraser size={16} />
// // //           </Button>

// // //           {/* Pointer tool (upper finger hand) */}
// // //           <Button
// // //             size="icon"
// // //             type="button"
// // //             variant="outline"
// // //             disabled={pointerMode}
// // //             onClick={handlePointerClick}
// // //             className={`${
// // //               pointerMode ? 'bg-purple-200 border-2 border-purple-500' : 'border-transparent'
// // //             }`} // Add outline or border when active
// // //           >
// // //             <Hand size={16} />
// // //           </Button>
// // //         </div>

// // //         {/* Actions */}
// // //         <div className="flex flex-col gap-3 pt-6">
// // //           <Button size="icon" type="button" variant="outline" onClick={handleUndoClick}>
// // //             <Undo size={16} />
// // //           </Button>
// // //           <Button size="icon" type="button" variant="outline" onClick={handleRedoClick}>
// // //             <Redo size={16} />
// // //           </Button>
// // //           <Button size="icon" type="button" variant="outline" onClick={handleClearClick}>
// // //             <RotateCcw size={16} />
// // //           </Button>

// // //           <Button size="icon" type="button" variant="outline" onClick={handleSave}>
// // //             <Save size={16} />
// // //           </Button>
// // //         </div>
// // //       </div>

// // //       {/* Textboxes for notes below the canvas */}
// // //       <div className="flex flex-col gap-3 pt-6 w-1/3">
// // //         {pointers.map((pointer, index) => (
// // //           <div key={index} className="flex flex-col">
// // //             <label htmlFor={`note-${index}`} className="text-sm text-purple-500">
// // //               Point {index + 1} Notes
// // //             </label>
// // //             <textarea
// // //               id={`note-${index}`}
// // //               value={notes[index]}
// // //               onChange={(event) => handleNoteChange(index, event)}
// // //               className="p-2 border rounded-lg"
// // //               placeholder="Write your notes here..."
// // //               rows="3"
// // //             />
// // //           </div>
// // //         ))}
// // //       </div>
// // //     </div>
// // //   );
// // // }

// import { useRef, useState, useEffect } from 'react';
// import { ReactSketchCanvas } from 'react-sketch-canvas';
// import { Button } from 'react-bootstrap';
// import { Eraser, Pen, Redo, RotateCcw, Save, Undo, Hand } from 'lucide-react';

// const BodyChart = ({ imageSrc }) =>  {
//   const colorInputRef = useRef(null);
//   const canvasRef = useRef(null);
//   const [strokeColor, setStrokeColor] = useState('#a855f7');
//   const [eraseMode, setEraseMode] = useState(false);
//   const [penMode, setPenMode] = useState(true);
//   const [pointerMode, setPointerMode] = useState(false); // Track pointer mode

//   // Path to the image file in the public folder
//   // const bodyChartImage = '/9298141.jpg';
//   const [bodyChartImage, setBodyChartImage] = useState(null); // State for BodyChart image
//   // const canvasRef = useRef(null);

//   // useEffect(() => {
//   //     // Example: Set the background image when the component mounts
//   //     setBodyChartImage('/9298141.jpg');
//   // }, []); // Ensure this effect runs only once on mount

  
//   useEffect(() => {
//     // Ensure each Spine component has its own image, passed via props
//     if (imageSrc) {
//       setBodyChartImage(imageSrc);
//     }
//   }, [imageSrc]);
//   useEffect(() => {
//     return () => {
//         // Clear the canvas or reset background image
//         setBodyChartImage(null);  // For example, reset the background image
//     };
// }, []);

//   // State to store the pointer positions and their associated notes
//   const [pointers, setPointers] = useState([]);
//   const [notes, setNotes] = useState([]);

//   // Handle the click on the canvas to add a pointer
//   const handleCanvasClick = (event) => {
//     if (pointerMode) {
//       const canvasRect = canvasRef.current.getCanvas().getBoundingClientRect(); // Get canvas bounding rectangle
//       const x = event.clientX - canvasRect.left; // Get X coordinate within canvas
//       const y = event.clientY - canvasRect.top;  // Get Y coordinate within canvas

//       // Add the new pointer position and initialize a blank note for it
//       setPointers((prev) => [...prev, { x, y }]);
//       setNotes((prev) => [...prev, '']); // Initialize a blank note for each pointer
//     }
//   };

//   // Handle changes to the notes input
//   const handleNoteChange = (index, event) => {
//     const newNotes = [...notes];
//     newNotes[index] = event.target.value;
//     setNotes(newNotes);
//   };

//   function handleStrokeColorChange(event) {
//     setStrokeColor(event.target.value);
//   }

//   // Handle drawing modes
//   function handleEraserClick() {
//     setEraseMode(true);
//     setPenMode(false);
//     setPointerMode(false); // Deactivate pointer mode if eraser is selected
//   }

//   function handlePenClick() {
//     setEraseMode(false);
//     setPenMode(true);
//     setPointerMode(false); // Deactivate pointer mode if pen is selected
//   }

//   function handlePointerClick() {
//     setPointerMode(true); // Activate pointer mode
//     setPenMode(false);    // Deactivate pen mode
//     setEraseMode(false);  // Deactivate erase mode
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

//   return (
//     <div className="mt-6 flex gap-4">
//       <div className="relative flex-1">
//         <ReactSketchCanvas
//           width="100%"
//           height="430px"
//           ref={canvasRef}
//           strokeColor={strokeColor}
//           canvasColor="transparent" // Transparent canvas so the image shows through
//           backgroundImage={bodyChartImage} // Set image as background
//           onClick={handleCanvasClick} // Register the click handler for pointer mode
//           className="!rounded-2xl !border-purple-500 dark:!border-purple-800"
//           eraseMode={eraseMode} // Pass eraseMode state to control eraser behavior
//           penMode={penMode}
//           disabled={!pointerMode} // Disable drawing when pointer mode is active
//         />

//         {/* Render pointers on the canvas */}
//         {pointers.map((pointer, index) => (
//           <div
//             key={index}
//             className="absolute"
//             style={{
//               left: `${pointer.x}px`,
//               top: `${pointer.y}px`,
//               transform: 'translate(-50%, -50%)',
//             }}
//           >
//             <div className="w-6 h-6 bg-purple-500 text-white text-xs flex items-center justify-center rounded-full">
//               {index + 1}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Toolbar on the right */}
//       <div className="flex flex-col items-center gap-y-6 divide-y divide-purple-200 py-4 dark:divide-purple-900 w-32">
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
//         <div className="flex flex-col gap-3 pt-6">
//           <Button
//             size="icon"
//             type="button"
//             variant="outline"
//             disabled={penMode || pointerMode} // Disable pen button if pointer or pen mode is active
//             onClick={handlePenClick}
//           >
//             <Pen size={16} />
//           </Button>
//           <Button
//             size="icon"
//             type="button"
//             variant="outline"
//             disabled={eraseMode || pointerMode} // Disable eraser button if pointer mode is active
//             onClick={handleEraserClick}
//           >
//             <Eraser size={16} />
//           </Button>

//           {/* Pointer tool (upper finger hand) */}
//           <Button
//             size="icon"
//             type="button"
//             variant="outline"
//             disabled={pointerMode}
//             onClick={handlePointerClick}
//             className={`${
//               pointerMode ? 'bg-purple-200 border-2 border-purple-500' : 'border-transparent'
//             }`} // Add outline or border when active
//           >
//             <Hand size={16} />
//           </Button>
//         </div>

//         {/* Actions */}
//         <div className="flex flex-col gap-3 pt-6">
//           <Button size="icon" type="button" variant="outline" onClick={handleUndoClick}>
//             <Undo size={16} />
//           </Button>
//           <Button size="icon" type="button" variant="outline" onClick={handleRedoClick}>
//             <Redo size={16} />
//           </Button>
//           <Button size="icon" type="button" variant="outline" onClick={handleClearClick}>
//             <RotateCcw size={16} />
//           </Button>

//           <Button size="icon" type="button" variant="outline" onClick={handleSave}>
//             <Save size={16} />
//           </Button>
//         </div>
//       </div>

//       {/* Textboxes for notes below the canvas */}
//       <div className="flex flex-col gap-3 pt-6 w-1/3">
//         {pointers.map((pointer, index) => (
//           <div key={index} className="flex flex-col">
//             <label htmlFor={`note-${index}`} className="text-sm text-purple-500">
//               Point {index + 1} Notes
//             </label>
//             <textarea
//               id={`note-${index}`}
//               value={notes[index]}
//               onChange={(event) => handleNoteChange(index, event)}
//               className="p-2 border rounded-lg"
//               placeholder="Write your notes here..."
//               rows="3"
//             />
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default BodyChart;

import { useRef, useState } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import { Button } from 'react-bootstrap';
import { Hand, Save, Undo, Redo, RotateCcw } from 'lucide-react';

export default function BodyChart() {
  const colorInputRef = useRef(null);
  const canvasRef = useRef(null);
  const [pointerMode, setPointerMode] = useState(true); 
  const [pointers, setPointers] = useState([]); 
  const [notes, setNotes] = useState([]); 

  const bodyChartImage = '/shutterstock_1855173277_edited.jpeg';

  const handleCanvasClick = (event) => {
    if (pointerMode) {
      const canvasRect = event.target.getBoundingClientRect(); 
      const x = event.clientX - canvasRect.left; 
      const y = event.clientY - canvasRect.top;  

      setPointers((prev) => [...prev, { x, y }]);
      setNotes((prev) => [...prev, '']);
    }
  };

  const handleNoteChange = (index, event) => {
    const newNotes = [...notes];
    newNotes[index] = event.target.value;
    setNotes(newNotes);
  };

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

  function handleUndoClick() {
    canvasRef.current?.undo();
  }

  function handleRedoClick() {
    canvasRef.current?.redo();
  }

  function handleClearClick() {
    canvasRef.current?.clearCanvas();
  }

  return (
    <div className="mt-6 flex gap-4">
      <div className="relative flex-1" onClick={handleCanvasClick}> 
        <ReactSketchCanvas
          width="100%"
          height="430px"
          ref={canvasRef}
          canvasColor="transparent" 
          backgroundImage={bodyChartImage} 
          className="!rounded-2xl !border-purple-500 dark:!border-purple-800"
          disabled={!pointerMode} 
        />

        {pointers.map((pointer, index) => (
          <div
            key={index}
            className="absolute"
            style={{
              left: `${pointer.x}px`,
              top: `${pointer.y}px`,
              transform: 'translate(-50%, -50%)', 
            }}
          >
            <div className="w-6 h-6 bg-purple-500 text-white text-xs flex items-center justify-center rounded-full">
              {index + 1}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center gap-y-6 divide-y divide-purple-200 py-4 dark:divide-purple-900 w-32">
        <Button
          size="icon"
          type="button"
          variant="outline"
          disabled={pointerMode} 
          onClick={() => setPointerMode(true)} 
          className={`${pointerMode ? 'bg-purple-200 border-2 border-purple-500' : 'border-transparent'}`}
        >
          <Hand size={16} />
        </Button>

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

      <div className="flex flex-col gap-3 pt-6 w-1/3">
        {pointers.map((pointer, index) => (
          <div key={index} className="flex flex-col">
            <label htmlFor={`note-${index}`} className="text-sm text-purple-500">
              Point {index + 1} Notes
            </label>
            <textarea
              id={`note-${index}`}
              value={notes[index]}
              onChange={(event) => handleNoteChange(index, event)}
              className="p-2 border rounded-lg"
              placeholder="Write your notes here..."
              rows="3"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
