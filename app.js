import generateCriticalCSS from './routes/generateCriticalCSS';

const PORT = process.env.PORT || 3000;

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import logger from "./helpers/log";

let app = express();
app.use(cors());
app.use(bodyParser.json());

app.listen(PORT, function () {
	console.log(`Critical CSS API listening on port ${PORT}!`);
});

app.post('/', generateCriticalCSS);
app.get('/', (req, res) => {
	res.status(201).send('Hello World');
});
