import express, { query } from 'express';
import {connection} from '../connection/connection.js';
const gdRouter = express.Router();

gdRouter
    .post('/post', postGd)
    .post('/check', checkGd)

export function postGd(req, resFinal){
    var data = req.body;
    if(typeof data.bitsid != 'undefined'){
        var date = new Date();
            
        var mobile=data.mobile;
        var topic=data.d_topic;
        var booking_time=data.booking_time;
        var p_no=data.p_no;
        var booking_date=data.date;


        var created_date = ("0" + date.getDate()).slice(-2)+'/'+("0" + (date.getMonth() + 1)).slice(-2)+'/'+date.getFullYear();
        var created_time = date.getSeconds()+':'+date.getMinutes()+':'+date.getHours(); // FORMAT date -----------------

        var bitsid = data.bitsid;
        var query = 'select * from users where bitsid = ?';
        connection.query(query, [bitsid], (err, res)=>{
            if(err) throw err;
            var info = Object.values(JSON.parse(JSON.stringify(res)));

            var name = info['name'];
            var bitsid = info['bitsid'];
            var email = info['email'];

            query = 'select * from group_discussion_room_booking where booking_date= ? and starting_time = ? and stage= "1" ';
            connection.query(query, [booking_date, booking_time], (err, res)=>{
                if (err) throw err;
                var arr = Object.values(JSON.parse(JSON.stringify(res)));

                if(arr.length == 0){
                    query = 'select * from group_discussion_room_booking where stage="1" and bitsid= ? and booking_date= ?';
                    connection.query(query, [bitsid, booking_date], (err, res)=>{
                        if(err) throw err;
                        if(Object.values(JSON.parse(JSON.stringify(res))).length == 0){

                        query_holidays = 'select date from av_room_booking_holiday where date= ?';
                        connection.query(query, [booking_date], (err, res_holidays)=>{
                            if(err) throw err;
                            
                            if(Object.values(JSON.parse(JSON.stringify(res_holidays))).length > 0){

                                var query ='select times from av_room_booking_holiday_times where times=? ';
                                connection.query(query, [booking_time], (err, res)=>{
                                    if(err) throw err;
                                    if(Object.values(JSON.parse(JSON.stringify(res))).length == 0){
                                        if(typeof data.radio_purpose != 'undefined' ){

                                        var purpose = data.radio_purpose;
                                        var chk ='';

                                        if(typeof data.requirements != 'undefined'){
                                            requirements = data.checkbox_req;
                                            for(var chk1 in requirements){
                                                chk += `${chk1},`
                                            }
                                        }
                                        query = `insert into group_discussion_room_booking(name, bitsid, email, mobile, purpose, topic, booking_date, starting_time, p_no, requirements, status, created_date, created_time, stage, action_taken_by) 
										values(?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?, ?, 1, "")`; 
                                        connection.query(query, [name, bitsid, email, mobile, purpose, topic, booking_date, booking_time, p_no, chk, "pending", created_date, created_time], (err, res)=>{
                                            if(err) throw err;

                                            resFinal.send({
                                                message:'Thank you for sending your request.We will get back to you soon.'
                                            })
                                        })
                                        
                                        } else resFinal.send({
                                            err: -4,
                                            message: 'Please select your purpose for booking'
                                        })

                                    }  else resFinal.send({
                                        err: -3,
                                        message: 'Sorry! Library is open till 05:00 PM only.Therefore, you can not book this room.'
                                    })
                                })
                            } else {
                                if(typeof data.radio_purpose != 'undefined'){
                                    purpose = data.radio_purpose
                                    var chk = '';

                                    if(typeof data.requirements != 'undefined'){
                                        requirements = data.checkbox_req;
                                        for(var chk1 in requirements){
                                            chk += `${chk1},`
                                        }
                                    }
                                    
                                    query = `insert into group_discussion_room_booking(name, bitsid, email, mobile, purpose, topic, booking_date, starting_time, p_no, requirements, status, created_date, created_time, stage, action_taken_by) 
                                    values('?', '?', '?', '?', '?', '?', '?', '?', '?', '?', '?', '?', '?', 1, "")`; 
                                    connection.query(query, [name, bitsid, email, mobile, purpose, topic, booking_date, booking_time, p_no, chk, "pending", created_date, created_time], (err, res)=>{
                                        if(err) throw err;

                                        resFinal.send({
                                            message:'Thank you for sending your request.We will get back to you soon.'
                                        })
                                    })

                                } else resFinal.send({
                                    err:-4,
                                    message:'Please select your purpose for booking'
                                })
                            }

                        })

                        
                        } else resFinal.send({
                            message: 'You can not book for more than one hour a day. Please select another date for a new booking.',
                            err: -3
                        })
                    })
                } else  
                    resFinal.send({
                        err: 2,
                        message: 'Group Discussion Room is already booked on your selected date and time. Please select different time slot.'
                })
            }) 
        })
    } else
        resFinal.send({
            err: 1,
            message :'Sorry! Either you have not logged in or your session has expired'
        });
}

function checkGd(req, resFinal){
    var data = req.body;
    var date = data.date;

    var query = `select gd.booking_date, gd.starting_time 
    from group_discussion_room_booking gd
    where booking_date= ? and stage="1"`;
    connection.query(query, [date], (err, res)=>{
        if(err) throw err;
        var array = Object.values(JSON.parse(JSON.stringify(res)));
        if(array.length > 0)
            res.send({array: array});

        else res.send({array: [], message:  "You can select any time between 09:00AM to 06:00PM"})
    })
}

export default gdRouter;