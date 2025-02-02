import express from "express";
import expressWs from "express-ws";
import cors from "cors";
import {WebSocket} from "ws";

const app = express();
expressWs(app);

const port = 8000;
app.use(cors());

const router = express.Router();

interface PX {
    x: number;
    y: number;
}

interface IncomingPX {
    type: string;
    payload: PX;
}

const connectedClients:WebSocket[] = [];

const PXArray: PX[] = [];

router.ws('/canvas', (ws, _req) => {
    connectedClients.push(ws);
    console.log('Client connected. Client total - ', connectedClients.length);

    ws.send(JSON.stringify({
        type: 'CANVAS',
        payload: PXArray,
    }));

    ws.on('message', (message) => {
        try {
            const decodedPX = JSON.parse(message.toString()) as IncomingPX;

            if (decodedPX.type === 'NEW_PX') {
                PXArray.push(decodedPX.payload);

                connectedClients.forEach((client) => {
                    client.send(JSON.stringify({
                        type: 'NEW_PX',
                        payload: decodedPX.payload
                    }));
                });
            }

        } catch (e) {
            ws.send(JSON.stringify({error: 'Invalid message'}));
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        const index = connectedClients.indexOf(ws);
        connectedClients.splice(index, 1);
        console.log('Client total - ', connectedClients.length);
    });
});

app.use(router);

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});