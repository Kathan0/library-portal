import { createRequire } from "module";
const require = createRequire(import.meta.url);

import brainstormRouter  from '../routes/brainstorm.js'
import gdRouter  from '../routes/gd.js'
import ideationRouter  from '../routes/ideation.js'
import innovationRouter  from '../routes/innovation.js'
import interviewRouter  from '../routes/interview.js'
import makerspaceRouter  from '../routes/makerspace.js'
import rareBooksRouter  from '../routes/rare_books.js'
import loginRouter from "../routes/login.js";

const cors = require('cors');

const express = require('express');
const port = 4000;
const app = express();

app.use(cors());

const bodyParser = require('body-parser'); // application/json
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
  }));

var multer = require('multer'); // Multipart form data
var upload = multer();

app.use(upload.array()); 
app.use(express.static('public'));

app.use('/login', loginRouter);
app.use('/brainstorm', brainstormRouter);
app.use('/gd', gdRouter);
app.use('/ideation', ideationRouter);
app.use('/innovation', innovationRouter);
app.use('/interview', interviewRouter);
app.use('/makerspace', makerspaceRouter);
app.use('/rarebooks', rareBooksRouter);

app.listen(port, (err, res) => {
    if (err) throw err
    console.log('server is listening on ' + port);
})