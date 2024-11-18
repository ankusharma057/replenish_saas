
import { useRef, useState } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import { Button } from 'react-bootstrap';
import { Hand, Save, Undo, Redo, RotateCcw } from 'lucide-react';

export default function SideBySide() {
  const colorInputRef = useRef(null);
  const canvasRef = useRef(null);
  const [pointerMode, setPointerMode] = useState(true); 
  const [pointers, setPointers] = useState([]); 
  const [notes, setNotes] = useState([]); 
  const [firstImage, setFirstImage] = useState(null); 
  const [secondImage, setSecondImage] = useState(null); 

  const handleFirstImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFirstImage(imageUrl);
    }
  };

  const handleSecondImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSecondImage(imageUrl);
    }
  };

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
    <div className="mt-6 flex flex-col items-center">
      <div className="relative flex gap-4 max-w-4xl">
        {firstImage && secondImage ? (
          <div className="flex gap-4 w-full">
            <ReactSketchCanvas
              width="48%"
              height="430px"
              ref={canvasRef}
              canvasColor="transparent" 
              backgroundImage={firstImage} 
              className="!rounded-2xl !border-purple-500 dark:!border-purple-800"
              disabled={!pointerMode} 
            />
            <ReactSketchCanvas
              width="48%"
              height="430px"
              ref={canvasRef}
              canvasColor="transparent" 
              backgroundImage={secondImage} 
              className="!rounded-2xl !border-purple-500 dark:!border-purple-800"
              disabled={!pointerMode} 
            />
          </div>
        ) : (
          <p className="text-purple-500">Please upload both images to see them side by side.</p>
        )}

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

      <div className="flex flex-col items-center gap-y-6 divide-y divide-purple-200 py-4 dark:divide-purple-900 w-32 mt-6">
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

      <div className="flex flex-col gap-3 mt-6 w-full max-w-4xl">
        <div>
          <label htmlFor="firstImage" className="text-sm text-purple-500">Upload First Image</label>
          <input
            type="file"
            id="firstImage"
            accept="image/*"
            onChange={handleFirstImageChange}
            className="border p-2 rounded-lg w-full"
          />
        </div>

        {/* Second Image Upload */}
        <div className="mt-4">
          <label htmlFor="secondImage" className="text-sm text-purple-500">Upload Second Image</label>
          <input
            type="file"
            id="secondImage"
            accept="image/*"
            onChange={handleSecondImageChange}
            className="border p-2 rounded-lg w-full"
          />
        </div>
      </div>

      {/* Textboxes for notes below the canvas */}
      <div className="flex flex-col gap-3 pt-6 w-full max-w-4xl">
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

// import { useRef, useState } from 'react';
// import { ReactSketchCanvas } from 'react-sketch-canvas';
// import { Button } from 'react-bootstrap';
// import { Hand, Save, Undo, Redo, RotateCcw } from 'lucide-react';

// export default function SideBySide() {
//   const colorInputRef = useRef(null);
//   const canvasRef = useRef(null);
//   const [pointerMode, setPointerMode] = useState(true); 
//   const [pointers, setPointers] = useState([]); 
//   const [notes, setNotes] = useState([]); 
//   const [firstImage, setFirstImage] = useState(null);
//   const [secondImage, setSecondImage] = useState(null); 

//   const handleFirstImageChange = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       const imageUrl = URL.createObjectURL(file);
//       setFirstImage(imageUrl);
//     }
//   };

//   const handleSecondImageChange = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       const imageUrl = URL.createObjectURL(file);
//       setSecondImage(imageUrl);
//     }
//   };

//   const handleCanvasClick = (event) => {
//     if (pointerMode) {
//       const canvasRect = event.target.getBoundingClientRect(); 
//       const x = event.clientX - canvasRect.left; 
//       const y = event.clientY - canvasRect.top;  

//       setPointers((prev) => [...prev, { x, y }]);
//       setNotes((prev) => [...prev, '']); 
//     }
//   };

//   const handleNoteChange = (index, event) => {
//     const newNotes = [...notes];
//     newNotes[index] = event.target.value;
//     setNotes(newNotes);
//   };

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

//   function handleUndoClick() {
//     canvasRef.current?.undo();
//   }

//   function handleRedoClick() {
//     canvasRef.current?.redo();
//   }

//   function handleClearClick() {
//     canvasRef.current?.clearCanvas();
//   }

//   return (
//     <div className="mt-6 flex gap-4">
//       <div className="relative flex gap-4 w-full">
//         {firstImage && secondImage ? (
//           <div className="flex gap-4 w-full">
//             <div className="relative w-1/2">
//               <ReactSketchCanvas
//                 width="100%"
//                 height="430px"
//                 ref={canvasRef}
//                 canvasColor="transparent" 
//                 backgroundImage={firstImage} 
//                 className="!rounded-2xl !border-purple-500 dark:!border-purple-800"
//                 disabled={!pointerMode} 
//               />
//               <div className="mt-3">
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={handleFirstImageChange}
//                   className="border p-2 rounded-lg w-full"
//                 />
//               </div>
//             </div>

//             <div className="relative w-1/2">
//               <ReactSketchCanvas
//                 width="100%"
//                 height="430px"
//                 ref={canvasRef}
//                 canvasColor="transparent" 
//                 backgroundImage={secondImage} 
//                 className="!rounded-2xl !border-purple-500 dark:!border-purple-800"
//                 disabled={!pointerMode} 
//               />
//               <div className="mt-3">
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={handleSecondImageChange}
//                   className="border p-2 rounded-lg w-full"
//                 />
//               </div>
//             </div>
//           </div>
//         ) : (
//           <p className="text-purple-500">Please upload both images to see them side by side.</p>
//         )}

//         {/* Render pointers on the canvas */}
//         {pointers.map((pointer, index) => (
//           <div
//             key={index}
//             className="absolute"
//             style={{
//               left: `${pointer.x}px`,
//               top: `${pointer.y}px`,
//               transform: 'translate(-50%, -50%)', // To center the pointer circle
//             }}
//           >
//             <div className="w-6 h-6 bg-purple-500 text-white text-xs flex items-center justify-center rounded-full">
//               {index + 1}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Toolbar on the right */}
//       <div className="flex flex-col items-center gap-y-6 divide-y divide-purple-200 py-4 dark:divide-purple-900 w-32 mt-6">
//         {/* Pointer tool (upper finger hand) */}
//         <Button
//           size="icon"
//           type="button"
//           variant="outline"
//           disabled={pointerMode} // Pointer mode is always active, so we disable the button
//           onClick={() => setPointerMode(true)} // No need for state change, it's always active
//           className={`${pointerMode ? 'bg-purple-200 border-2 border-purple-500' : 'border-transparent'}`}
//         >
//           <Hand size={16} />
//         </Button>

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
//     </div>
//   );
// }
