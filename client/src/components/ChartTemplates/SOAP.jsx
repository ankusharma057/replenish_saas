// import React, { useState } from 'react';

// export default function SOAP() {
//   const [editorText, setEditorText] = useState({
//     subjective: '',
//     objective: '',
//     assessment: '',
//     plan: '',
//   });

//   // Handle text change for each section
//   const handleChange = (e, section) => {
//     setEditorText({
//       ...editorText,
//       [section]: e.target.value,
//     });
//   };

//   return (
//     <div className="mt-6 flex flex-col max-w-2xl gap-6">
//       <h2 className="font-semibold text-xl mb-4">SOAP Notes</h2>
//       {/* Subjective Section */}
//       <div className="space-y-4">
//         <h3 className="font-medium text-lg">Subjective</h3>
//         <textarea
//           value={editorText.subjective}
//           onChange={(e) => handleChange(e, 'subjective')}
//           placeholder="Enter Subjective information..."
//           rows="6"
//           className="w-full p-4 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />
//       </div>

//       {/* Objective Section */}
//       <div className="space-y-4">
//         <h3 className="font-medium text-lg">Objective</h3>
//         <textarea
//           value={editorText.objective}
//           onChange={(e) => handleChange(e, 'objective')}
//           placeholder="Enter Objective information..."
//           rows="6"
//           className="w-full p-4 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />
//       </div>

//       {/* Assessment Section */}
//       <div className="space-y-4">
//         <h3 className="font-medium text-lg">Assessment</h3>
//         <textarea
//           value={editorText.assessment}
//           onChange={(e) => handleChange(e, 'assessment')}
//           placeholder="Enter Assessment information..."
//           rows="6"
//           className="w-full p-4 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />
//       </div>

//       {/* Plan Section */}
//       <div className="space-y-4">
//         <h3 className="font-medium text-lg">Plan</h3>
//         <textarea
//           value={editorText.plan}
//           onChange={(e) => handleChange(e, 'plan')}
//           placeholder="Enter Plan information..."
//           rows="6"
//           className="w-full p-4 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />
//       </div>
//     </div>
//   );
// }

import React, { useState, useRef, useEffect } from 'react';

export default function SOAP() {
  const [editorText, setEditorText] = useState({
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
  });

  const [selectedText, setSelectedText] = useState('');
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  const [toolbarVisible, setToolbarVisible] = useState(false);

  const textAreaRefs = useRef({
    subjective: React.createRef(),
    objective: React.createRef(),
    assessment: React.createRef(),
    plan: React.createRef(),
  });

  const handleChange = (e, section) => {
    setEditorText({
      ...editorText,
      [section]: e.target.value,
    });
  };

  const handleSelection = (e) => {
    const selectedText = window.getSelection().toString();

    if (selectedText) {
      setSelectedText(selectedText);

      const textarea = e.target;
      const { selectionStart, selectionEnd } = textarea;
      const selectedTextLength = selectedText.length;

      const startPos = textarea.selectionStart;

      const cursorPosition = textarea.selectionStart;

      const cursorCoordinates = getCursorCoordinates(textarea, cursorPosition);

      const toolbarPosition = {
        top: cursorCoordinates.top + window.scrollY + 5,
        left: cursorCoordinates.left + window.scrollX - 75,
      };

      setToolbarPosition(toolbarPosition);
      setToolbarVisible(true); 
    } else {
      setToolbarVisible(false); 
    }
  };

  const getCursorCoordinates = (textarea, cursorPosition) => {
    const rect = textarea.getBoundingClientRect();
    const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight, 10);

    const row = Math.floor(cursorPosition / textarea.cols);
    const column = cursorPosition % textarea.cols;

    return {
      top: rect.top + row * lineHeight,
      left: rect.left + column * 10,
    };
  };

  const applyFormatting = (format) => {
    const section = Object.keys(editorText).find((key) => textAreaRefs.current[key].current === document.activeElement);
    const textArea = textAreaRefs.current[section].current;

    const start = textArea.selectionStart;
    const end = textArea.selectionEnd;
    const selectedText = textArea.value.substring(start, end);

    if (selectedText) {
      let newText = '';
      if (format === 'bold') {
        newText = `<b>${selectedText}</b>`;
      } else if (format === 'italic') {
        newText = `<i>${selectedText}</i>`;
      } else if (format === 'underline') {
        newText = `<u>${selectedText}</u>`;
      }

      const newValue = textArea.value.slice(0, start) + newText + textArea.value.slice(end);
      textArea.value = newValue;

      setEditorText({
        ...editorText,
        [section]: newValue,
      });
    }
    setToolbarVisible(false); 
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (toolbarVisible && !e.target.closest('.toolbar')) {
        setToolbarVisible(false); 
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [toolbarVisible]);

  return (
    <div className="mt-6 flex flex-col max-w-2xl gap-6">
      <h2 className="font-semibold text-xl mb-4">SOAP Notes</h2>

      <div className="space-y-4">
        <h3 className="font-medium text-lg">Subjective</h3>
        <textarea
          ref={textAreaRefs.current.subjective}
          value={editorText.subjective}
          onChange={(e) => handleChange(e, 'subjective')}
          placeholder="Enter Subjective information..."
          rows="6"
          onMouseUp={handleSelection} 
          onDoubleClick={handleSelection} 
          className="w-full p-4 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-4">
        <h3 className="font-medium text-lg">Objective</h3>
        <textarea
          ref={textAreaRefs.current.objective}
          value={editorText.objective}
          onChange={(e) => handleChange(e, 'objective')}
          placeholder="Enter Objective information..."
          rows="6"
          onMouseUp={handleSelection}
          onDoubleClick={handleSelection}
          className="w-full p-4 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-4">
        <h3 className="font-medium text-lg">Assessment</h3>
        <textarea
          ref={textAreaRefs.current.assessment}
          value={editorText.assessment}
          onChange={(e) => handleChange(e, 'assessment')}
          placeholder="Enter Assessment information..."
          rows="6"
          onMouseUp={handleSelection}
          onDoubleClick={handleSelection}
          className="w-full p-4 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-4">
        <h3 className="font-medium text-lg">Plan</h3>
        <textarea
          ref={textAreaRefs.current.plan}
          value={editorText.plan}
          onChange={(e) => handleChange(e, 'plan')}
          placeholder="Enter Plan information..."
          rows="6"
          onMouseUp={handleSelection}
          onDoubleClick={handleSelection}
          className="w-full p-4 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {toolbarVisible && selectedText && (
        <div
          className="toolbar fixed bg-white p-2 border rounded-md shadow-sm"
          style={{
            top: toolbarPosition.top,
            left: toolbarPosition.left,
            zIndex: 1000,
          }}
        >
          <button onClick={() => applyFormatting('bold')} className="px-4 py-2 border rounded-md">B</button>
          <button onClick={() => applyFormatting('italic')} className="px-4 py-2 border rounded-md">I</button>
          <button onClick={() => applyFormatting('underline')} className="px-4 py-2 border rounded-md">U</button>
        </div>
      )}
    </div>
  );
}
