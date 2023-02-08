import express from 'express';
import {connection} from '../connection/connection.js';
const rareBooksRouter = express.Router();

rareBooksRouter
    .get('/admin', getAdmin)

export function getAdmin(req, res){
    res.send({
        message: "brainstorm"
    })
}

export default rareBooksRouter;