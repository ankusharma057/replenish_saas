import React, { useState, useRef } from 'react';

const Signature = () => {
  const [mode, setMode] = useState('draw');
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const signatureContentRef = useRef(null);

  const signatureAreaStyle = {
    width: '400px',
    marginTop: '20px',
  };

  const signatureContentStyle = {
    marginTop: '10px',
    height: '200px',
    border: '1px solid #ccc',
    position: 'relative',
  };

  const canvasStyle = {
    width: '100%',
    height: '100%',
    border: '1px solid #ccc',
  };

  const textAreaStyle = {
    width: '100%',
    height: '100%',
    border: 'none',
    resize: 'none',
    padding: '10px',
    fontSize: '16px',
    outline: 'none',
  };

  const modeSelectorStyle = {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '10px',
  };

  const bulletStyle = {
    margin: '0 15px',
    position: 'relative',
    cursor: 'pointer',
    fontSize: '18px',
    padding: '5px 10px',
    background: '#f0f0f0',
    borderRadius: '50%',
    textAlign: 'center',
  };

  const selectedBulletStyle = {
    ...bulletStyle,
    backgroundColor: '#007bff',
    color: '#fff',
  };

  const startDrawing = (event) => {
    setIsDrawing(true);
    const { offsetX, offsetY } = event.nativeEvent;
    setLastPosition({ x: offsetX, y: offsetY });
  };

  const draw = (event) => {
    if (!isDrawing) return;

    const { offsetX, offsetY } = event.nativeEvent;
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(lastPosition.x, lastPosition.y);
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
    setLastPosition({ x: offsetX, y: offsetY });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const chooseSignatureMode = (newMode) => {
    setMode(newMode);
  };

  return (
    <div style={signatureAreaStyle}>
      <div style={modeSelectorStyle}>
        <div
          style={mode === 'draw' ? selectedBulletStyle : bulletStyle}
          onClick={() => chooseSignatureMode('draw')}
        >
          ● Draw
        </div>

        <div
          style={mode === 'type' ? selectedBulletStyle : bulletStyle}
          onClick={() => chooseSignatureMode('type')}
        >
          ● Type
        </div>
      </div>

      <div ref={signatureContentRef} style={signatureContentStyle}>
        {mode === 'draw' ? (
          <canvas
            ref={canvasRef}
            style={canvasStyle}
            width={signatureContentRef.current?.offsetWidth}
            height={signatureContentRef.current?.offsetHeight}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
          />
        ) : (
          <textarea style={textAreaStyle} />
        )}
      </div>
    </div>
  );
};

export default Signature;
