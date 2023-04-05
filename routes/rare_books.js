import express from 'express';
import {connection} from '../connection/connection.js';
const rareBooksRouter = express.Router();

rareBooksRouter
    .post('/submit', postSubmit)

export function postSubmit(req, resFinal){
    var data= req.body;
    
    var mobile=data.mobile;
	var date_req=data.date;
	var starting_time=data.starting_time;
    var ending_time=data.ending_time;

    var date = new Date();
    var created_date = ("0" + date.getDate()).slice(-2)+'/'+("0" + (date.getMonth() + 1)).slice(-2)+'/'+date.getFullYear();
    var created_time = date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();

    if(typeof data.bitsid !== 'undefined'){

        if(starting_time != ending_time){

            var query = 'USE bitslib; select * from users where bitsid=?';
            connection.query(query, [data.bitsid], (err, res)=>{
                if(err) throw err;
                var arr = Object.values(JSON.parse(JSON.stringify(res)));
                var name = arr[1][0]['name'];
                var bitsid = arr[1][0]['bitsid'];
                var email = arr[1][0]['email'];

                if(typeof data.purpose !== 'undefined'){

                    query = `insert into rare_books_room_booking(name, bitsid, email, mobile, purpose, date, starting_time, ending_time, status, created_date, created_time, stage) 
                    values(?, ?, ?, ?, ?, ?, ?, ?, "pending", ?, ?, 1)`;
                    connection.query(query, [name, bitsid, email, mobile, purpose, date_req, starting_time, ending_time, created_date, created_time], (err, res)=>{
                        if(err) throw err;
                        resFinal.send({
                            suc: 1,
                            message:'Thank you for sending your request. We will get back to you soon.'
                        })
                    })

                } else resFinal.send({
                    err: -3,
                    message: 'Please select your purpose for booking'
                })
            })

        } else resFinal.send({
            err: -2,
            message: 'Start time and end time should not be Equal!'
        })

    } else resFinal.send({
        err: -1,
        message: 'Sorry! Either you have not logged in or your session has expired'
    })
}

export default rareBooksRouter;