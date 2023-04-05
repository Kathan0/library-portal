import express from 'express';
import {connection} from '../connection/connection.js';
const interviewRouter = express.Router();

interviewRouter
    .post('/submit', postSubmit)
    .post('/check', postCheck)

export function postSubmit(req, res){
    var data = req.body;
    
	var mobile=data.mobile;
	var topic=data.d_topic;
	var booking_time=data.booking_time;
	var booking_date=data.date;

    var created_date = ("0" + date.getDate()).slice(-2)+'/'+("0" + (date.getMonth() + 1)).slice(-2)+'/'+date.getFullYear();
    var created_time = date.getHours()+":"+date.getMinutes()+':'+date.getSeconds();

    if(data.bitsid != 'unedfined'){

        var query = 'use bitslib; select * from users where bitsid=?';
        connection.query(query, [bitsid], (err, res)=>{
            if(err) throw err;

            var array = Object.values(JSON.parse(JSON.stringify(res)));
            var name = array[1][0].name;
            var bitsid = array[1][0].bitsid;
            var email = array[1][0].email;


            var query = 'select * from interview_booking where booking_date= ? and starting_time = ? and stage="1"';
            connection.query(query, [booking_date, booking_time], (err, res)=>{
                if(err) throw err;
                var array = Object.values(JSON.parse(JSON.stringify(res)));
                if(array.length == 0){
    
                    var query = 'select * from interview_booking where stage="1" and bitsid=? and booking_date=?';
                    connection.query(query, [bitsid, booking_date], (err, res)=>{
                        if(err) throw err;
                        var array = Object.values(JSON.parse(JSON.stringify(res)));
                        if(array.length < 2){
            
                            var query_holidays = 'select date from av_room_booking_holiday where date=?';
                            connection.query(query_holidays, [bitsid], (err, res)=>{
                                if(err) throw err;
                                var array = Object.values(JSON.parse(JSON.stringify(res)));
                                if(array.length > 0){
                    
                                    var query = 'select times from av_room_booking_holiday_times where times=?';
                                    connection.query(query, [booking_time], (err, res)=>{
                                        if(err) throw err;
                                        var array = Object.values(JSON.parse(JSON.stringify(res)));
                                        if(array.length == 0){
                                            if(data.radio_purpose != 'unedfined'){
                                                var purpose = data.purpose;

                                                if(purpose == 'Any other')
                                                    purpose = data.any_other;
                                                
                                                query = `insert into interview_booking (name, bitsid, email, mobile, purpose, topic, booking_date, starting_time, p_no, requirements, status, created_date, created_time, stage, action_taken_by) 
                                                values(?, ?, ?, ?, ?, ?, ?, ?, 1, 0, "pending", ?, ?, 1, "")`; 
                                                connection.query(query, [name, bitsid, email, mobile, purpose, topic, booking_date, booking_time, created_date, created_time], (err, res)=>{
                                                    if(err) throw err;

                                                    resFinal.send({
                                                        suc: 1,
                                                        message: 'Thank you for sending your request. We will get back to you soon.'
                                                    })
                                                })

                                            } else resFinal.send({
                                                err: -4,
                                                message: 'Please select your purpose for booking'
                                            })
                                        } else {
                                            resFinal.send({
                                            err: -3,
                                            message: "Sorry! Library is open till 05:00 PM only.Therefore, you can not book this room."
                                        })
                                        }
                                    })
                
                                } else {

                                    if(data.radio_purpose != 'unedfined'){
                                        var purpose = data.purpose;

                                        if(purpose == 'Any other')
                                            purpose = data.any_other;
                                        
                                        query = `insert into interview_booking (name, bitsid, email, mobile, purpose, topic, booking_date, starting_time, p_no, requirements, status, created_date, created_time, stage, action_taken_by) 
                                        values(?, ?, ?, ?, ?, ?, ?, ?, 1, 0, "pending", ?, ?, 1, "")`; 
                                        connection.query(query, [name, bitsid, email, mobile, purpose, topic, booking_date, booking_time, created_date, created_time], (err, res)=>{
                                            if(err) throw err;
                                            resFinal.send({
                                                suc: 1,
                                                message: 'Thank you for sending your request. We will get back to you soon.'
                                            })
                                        })

                                    } else resFinal.send({
                                        err: -4,
                                        message: 'Please select your purpose for booking'
                                    })

                                }
                            })
        
                        } else {
                            resFinal.send({
                            err: -2,
                            message: "You can not book for more than two hours a day. Please select another date for a new booking."
                        })
                        }
                    })

                } else {
                    resFinal.send({
                    err: -1,
                    message: "Interview Carrel is already booked on your selected date and time.Please select different time slot."
                })
                }
            })

        })

    } else resFinal.send({
        err: 0,
        message: 'Sorry! Either you have not logged in or your session has expired'
    })

}

export function postCheck(req, resFinal){
    var data = req.body;
    if(data.date != 'undefined'){
        var date = data.date;
        var query = 'use bitslib; select * from interview_booking where booking_date=? and stage="1"';
        connection.query(query, [date], (err, res)=>{
            if(err) throw err;
            var array = Object.values(JSON.parse(JSON.stringify(res)));
            if(array[1].length > 0){
                resFinal.send({
                    array: array[1]
                })
            } else resFinal.send({
                array:[],
                message: "You can select any time between 09:00AM to 06:00PM"
            })
        })
    } else resFinal.send({
        err: -1,
        message: 'Select date bruh'
    })
}

export default interviewRouter;