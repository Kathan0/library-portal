import express from 'express';
import {connection} from '../connection/connection.js';
const interviewRouter = express.Router();

interviewRouter
    .post('/submit', postSubmit)
    .post('/check', postCheck)

export function postSubmit(req, res){
    res.send({
        message: "brainstorm"
    })
}

export function postCheck(req, res){
    res.send({
        message: "brainstorm"
    })
}

export default interviewRouter;