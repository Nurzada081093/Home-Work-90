import './App.css';
import React, { useEffect, useRef, useState } from 'react';

interface PX {
  x: number;
  y: number;
}

interface IncomingPX {
  type: string;
  payload: PX;
}

const App = () => {
  const ws = useRef<WebSocket | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pxArray, setPxArray] = useState<PX[]>([]);

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

  const clickCanvas = (e: React.MouseEvent<HTMLCanvasElement>) => {

    if (!ws.current) return;

    const canvasValue = e.nativeEvent as MouseEvent;

    const newPX = {
      x: Math.round(canvasValue.offsetX),
      y: Math.round(canvasValue.offsetY),
    };

    ws.current.send(JSON.stringify({
      type: 'NEW_PX',
      payload: newPX,
    }));
  };

  console.log(pxArray);

  const drawPXInCanvas = () => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const drawPX = canvas.getContext('2d');
    if (!drawPX) return;

    if (Array.isArray(pxArray[0])) {
      pxArray[0].forEach((px) => {
        drawPX.beginPath();
        drawPX.arc(px.x, px.y, 3, 0, 2 * Math.PI);
        drawPX.fill();
      });
    }

    pxArray.forEach((px) => {
      drawPX.beginPath();
      drawPX.arc(px.x, px.y, 3, 0, 2 * Math.PI);
      drawPX.fill();
    });
  };

  useEffect(() => {
    drawPXInCanvas();
  }, [pxArray]);

  return (
    <>
      <canvas
        ref={canvasRef}
        width="500"
        height="500"
        style={{backgroundColor: 'green'}}
        onClick={clickCanvas}
      />
    </>
  )
};

export default App;
