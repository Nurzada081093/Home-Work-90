import React, { useEffect, useRef, useState } from 'react';
import { IncomingPX, PX } from '../types';

const Canvas = () => {
  const ws = useRef<WebSocket | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pxArray, setPxArray] = useState<PX[]>([]);
  const [color, setColor] = useState<string>('#000000');

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8000/canvas');

    ws.current.onclose = () => console.log('Connection closed');

    ws.current.onmessage = event => {
      const decodedPX = JSON.parse(event.data) as IncomingPX;

      if (decodedPX.type === 'CANVAS') {
        setPxArray((prevState) => [...prevState, decodedPX.payload]);
      }

      if (decodedPX.type === 'NEW_PX') {
        setPxArray((prevArray) => [...prevArray, decodedPX.payload]);
      }
    };

    return () => {
      if (ws.current) {
        ws.current.close();
        console.log('Connection closed');
      }
    };
  }, []);

  const getColor = (e:React.ChangeEvent<HTMLInputElement>) => {
    const {value} = e.target;
    setColor(value);
  };

  const clickCanvas = (e: React.MouseEvent<HTMLCanvasElement>) => {

    if (!ws.current) return;

    const canvasValue = e.nativeEvent as MouseEvent;

    const newPX = {
      x: Math.round(canvasValue.offsetX),
      y: Math.round(canvasValue.offsetY),
      color: color,
    };

    ws.current.send(JSON.stringify({
      type: 'NEW_PX',
      payload: newPX,
    }));
  };

  const drawPXInCanvas = () => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const drawPX = canvas.getContext('2d');
    if (!drawPX) return;

    if (Array.isArray(pxArray[0])) {
      pxArray[0].forEach((px) => {
        drawPX.beginPath();
        drawPX.arc(px.x, px.y, 5, 0, 2 * Math.PI);
        drawPX.fillStyle = px.color;
        drawPX.fill();
      });
    }

    pxArray.forEach((px) => {
      drawPX.beginPath();
      drawPX.arc(px.x, px.y, 5, 0, 2 * Math.PI);
      drawPX.fillStyle = px.color;
      drawPX.fill();
    });
  };

  useEffect(() => {
    drawPXInCanvas();
  }, [pxArray]);

  return (
    <div className="container">
      <div className="component">
        <h1>Canvas for painting</h1>
        <div>
          <input type="color" className='color' value={color} onChange={getColor}/>
        </div>
        <canvas
          className="canvas"
          ref={canvasRef}
          width="800"
          height="400"
          onClick={clickCanvas}
        />
      </div>
    </div>
  );
};

export default Canvas;