import generateCriticalCSS from './routes/generateCriticalCSS';

const PORT = process.env.PORT || 3000;

import express from 'express';

let app = express();

app.post('/', generateCriticalCSS);

app.listen(PORT, function () {
	console.log(`Critical CSS API listening on port ${PORT}!`);
});
