import express from 'express';
import {connection} from '../connection/connection.js';
const makerspaceRouter = express.Router();

makerspaceRouter
    .get('/admin', getAdmin)

export function getAdmin(req, res){
    res.send({
        message: "brainstorm"
    })
}

export default makerspaceRouter;