export interface PX {
  x: number;
  y: number;
  color: string;
}

export interface IncomingPX {
  type: string;
  payload: PX;
}