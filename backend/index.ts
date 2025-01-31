import express from "express";
import expressWs from "express-ws";
import cors from "cors";
import {WebSocket} from "ws";

const app = express();
expressWs(app);

const port = 8000;
app.use(cors());

const router = express.Router();

const connectedClients:WebSocket[] = [];

router.ws('/canvas', (ws, req) => {
    connectedClients.push(ws);
    console.log('Client connected. Client total - ', connectedClients.length);


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