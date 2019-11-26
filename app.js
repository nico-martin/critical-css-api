import generateCriticalCSS from './routes/generateCriticalCSS';

const PORT = process.env.PORT || 9090;

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import logger from "./helpers/log";

let app = express();
app.use(cors());
//app.use(bodyParser.json());

app.listen(PORT, function () {
	console.log(`Critical CSS API listening on port ${PORT}!`);
});

app.post('/', generateCriticalCSS);
app.get('/', (req, res) => {
	res.status(405).send('Please use a POST-Request');
});

app.post('/key/isValid', (req, res) => {
	res.status(200).send('true');
});
