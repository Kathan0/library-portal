import express from 'express';
import {connection} from '../connection/connection.js';
const innovationRouter = express.Router();

innovationRouter
    .get('/admin', getAdmin)

export function getAdmin(req, res){
    res.send({
        message: "brainstorm"
    })
}

export default innovationRouter;