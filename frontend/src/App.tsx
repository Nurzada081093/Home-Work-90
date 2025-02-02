import './App.css';
import { useEffect, useRef } from 'react';

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

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8000/canvas');

    ws.current.onclose = () => console.log('Connection closed');

    ws.current.onmessage = event => {
      const decodedPX = JSON.parse(event.data) as IncomingPX;
      console.log(decodedPX);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
        console.log('Connection closed');
      }
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        width="500"
        height="500"
        style={{backgroundColor: 'green'}}
      />
    </>
  )
};

export default App;
